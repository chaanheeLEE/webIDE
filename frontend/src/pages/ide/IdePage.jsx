import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import FileExplorer from '../../components/FileExplorer';
import Editor from '../../components/Editor';
import OutputConsole from '../../components/OutputConsole';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useFileTree } from '../../hooks/useFileTree';
import './IdePage.css';

const IdePage = () => {
    const { projectId } = useParams();
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

    return (
        <div className="main-layout">
            <Header />
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
                            onInitiateCreation={handleInitiateCreation}
                            onFinalizeCreation={handleFinalizeCreation}
                            onCancelCreation={handleCancelCreation}
                            onDeleteNode={handleDeleteNode}
                            onMoveNode={handleMoveNode}
                            onRenameNode={handleRenameNode}
                        />
                    </ErrorBoundary>
                </div>
                <div className="main-content">
                    <Editor activeFile={activeFile} onChange={handleEditorChange} />
                    <OutputConsole />
                </div>
            </div>
        </div>
    );
};

export default IdePage;
