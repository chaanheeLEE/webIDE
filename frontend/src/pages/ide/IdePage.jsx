import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import FileExplorer from '../../components/FileExplorer';
import Editor from '../../components/Editor';
import OutputConsole from '../../components/OutputConsole';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useFileTree } from '../../hooks/useFileTree';
import { getLanguageForFile, SUPPORTED_LANGUAGES } from '../../languages';
import { executeCode } from '../../api/codeExecuteApi';
import { getProjectDetails } from '../../api/projectApi';
import { getMemberInfo } from '../../api/memberApi';
import { useAuth } from '../../context/AuthContext';
import './IdePage.css';

const IdePage = () => {
    const { projectId } = useParams();
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [projectOwner, setProjectOwner] = useState(null);
    const { user } = useAuth();
    const editorRef = useRef(null);
    const {
        fileTree,
        activeFile,
        expandedFolders,
        creatingNode,
        handleFileSelect,
        handleFolderToggle,
        handleInitiateCreation,
        handleFinalizeCreation,
        handleCancelCreation,
        handleDeleteNode,
        handleMoveNode,
        handleRenameNode,
        handleEditorChange,
    } = useFileTree(projectId);

    // 프로젝트 소유자 확인 및 읽기 전용 모드 설정
    useEffect(() => {
        const checkProjectOwnership = async () => {
            try {
                // 현재 사용자 정보 가져오기
                const currentUserInfo = await getMemberInfo();
                setCurrentUser(currentUserInfo);

                // 프로젝트 상세 정보 가져오기
                const projectInfo = await getProjectDetails(projectId);
                setProjectOwner(projectInfo.memberEmail);
                
                // 현재 사용자와 프로젝트 소유자가 다르면 읽기 전용 모드
                const isOwner = currentUserInfo.email === projectInfo.memberEmail;
                setIsReadOnly(!isOwner);
                
            } catch (error) {
                console.error('Error checking project ownership:', error);
                // 오류 발생 시 안전을 위해 읽기 전용으로 설정
                setIsReadOnly(true);
            }
        };

        if (projectId) {
            checkProjectOwnership();
        }
    }, [projectId]);

    const handleRunCode = async () => {
        if (!activeFile || !activeFile.name) {
            alert('실행할 파일을 선택해주세요.');
            return;
        }
        if (isRunning) {
            return;
        }

        const langConfig = getLanguageForFile(activeFile.name);

        if (!langConfig || !langConfig.isRunnable) {
            setOutput('실행할 수 없는 파일 형식입니다.');
            return;
        }

        setIsRunning(true);
        setOutput('코드를 실행 중입니다...');
        try {
            const currentCode = editorRef.current?.getValue();
            if (currentCode === null || currentCode === undefined) {
                setOutput('에디터에서 코드를 가져올 수 없습니다.');
                setIsRunning(false);
                return;
            }

            const languageKey = Object.keys(SUPPORTED_LANGUAGES).find(key => SUPPORTED_LANGUAGES[key] === langConfig);

            const requestData = {
                projectId: projectId,
                code: currentCode,
                language: languageKey,
                version: langConfig.version,
            };
            
            const result = await executeCode(requestData);
            
            setOutput(result.output || JSON.stringify(result, null, 2));
        } catch (error) {
            console.error('Error executing code:', error);
            const errorMessage = error.response?.data?.message || error.message || '코드 실행 중 오류가 발생했습니다.';
            setOutput(errorMessage);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="main-layout">
            <Header onRunCode={handleRunCode} isRunning={isRunning} />
            {isReadOnly && (
                <div className="readonly-banner">
                    <span>🔒 이 프로젝트는 읽기 전용입니다. 파일을 수정할 수 없습니다.</span>
                </div>
            )}
            <div className="content-area">
                <div className="sidebar">
                    <ErrorBoundary>
                        <FileExplorer
                            fileTree={fileTree}
                            activeFile={activeFile}
                            expandedFolders={expandedFolders}
                            creatingNode={creatingNode}
                            onFileSelect={handleFileSelect}
                            onFolderToggle={handleFolderToggle}
                            onInitiateCreation={isReadOnly ? null : handleInitiateCreation}
                            onFinalizeCreation={isReadOnly ? null : handleFinalizeCreation}
                            onCancelCreation={handleCancelCreation}
                            onDeleteNode={isReadOnly ? null : handleDeleteNode}
                            onMoveNode={isReadOnly ? null : handleMoveNode}
                            onRenameNode={isReadOnly ? null : handleRenameNode}
                            isReadOnly={isReadOnly}
                        />
                    </ErrorBoundary>
                </div>
                <div className="main-content">
                    <Editor 
                        ref={editorRef} 
                        activeFile={activeFile} 
                        onChange={isReadOnly ? null : handleEditorChange}
                        isReadOnly={isReadOnly}
                    />
                    <OutputConsole output={output} />
                </div>
            </div>
        </div>
    );
};

export default IdePage;
