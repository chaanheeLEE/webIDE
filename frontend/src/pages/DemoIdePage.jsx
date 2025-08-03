import React, { useState, useRef, useMemo } from 'react';
import Header from '../components/Header';
import Editor from '../components/Editor';
import OutputConsole from '../components/OutputConsole';
import { getLanguageForFile, SUPPORTED_LANGUAGES } from '../languages';
import { executeCode } from '../api/codeExecuteApi';
import HELLO_WORLD_SNIPPETS from '../helloWorldSnippets';
import './DemoIdePage.css';

const DemoIdePage = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [currentCode, setCurrentCode] = useState(HELLO_WORLD_SNIPPETS['javascript'] || '');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const editorRef = useRef(null);

    // 언어들을 실행 가능 여부에 따라 분류
    const { runnableLanguages, viewOnlyLanguages } = useMemo(() => {
        const runnable = [];
        const viewOnly = [];
        
        Object.keys(HELLO_WORLD_SNIPPETS).forEach(lang => {
            const langConfig = SUPPORTED_LANGUAGES[lang];
            if (langConfig && langConfig.isRunnable) {
                runnable.push(lang);
            } else {
                viewOnly.push(lang);
            }
        });
        
        return { runnableLanguages: runnable, viewOnlyLanguages: viewOnly };
    }, []);

    const isCurrentLanguageRunnable = useMemo(() => {
        const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];
        return langConfig && langConfig.isRunnable;
    }, [selectedLanguage]);

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        setOutput(''); // 언어 변경 시 출력 초기화
        const snippet = HELLO_WORLD_SNIPPETS[language] || '';
        setCurrentCode(snippet);
    };

    const handleRunCode = async () => {
        if (isRunning || !isCurrentLanguageRunnable) {
            return;
        }

        const langConfig = SUPPORTED_LANGUAGES[selectedLanguage];

        if (!langConfig || !langConfig.isRunnable) {
            setOutput('이 언어는 실행할 수 없습니다. 코드 보기만 가능합니다.');
            return;
        }

        setIsRunning(true);
        setOutput('코드를 실행 중입니다...');
        try {
            const codeToExecute = editorRef.current?.getValue() || currentCode;
            if (!codeToExecute || codeToExecute.trim() === '') {
                setOutput('실행할 코드가 없습니다.');
                setIsRunning(false);
                return;
            }

            const languageKey = selectedLanguage;

            const requestData = {
                language: languageKey,
                code: codeToExecute,
                version: langConfig.version,
                filename: `demo.${selectedLanguage}`
            };
            
            console.log('Executing code with data:', requestData);
            
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

    const activeFile = {
        id: 'demo',
        name: `demo.${selectedLanguage}`,
        content: currentCode,
        path: `/demo.${selectedLanguage}`
    };

    const handleCodeChange = (newCode) => {
        setCurrentCode(newCode);
    };

    return (
        <div className="demo-ide-layout">
            <Header 
                onRunCode={handleRunCode} 
                isRunning={isRunning} 
                isRunDisabled={!isCurrentLanguageRunnable}
            />
            <div className="demo-content-area">
                <div className="demo-sidebar">
                    <h3>체험용 IDE</h3>
                    <p>다양한 언어로 Hello World를 실행해보세요!</p>
                    
                    <div className="language-selector">
                        <h4>실행 가능한 언어:</h4>
                        {runnableLanguages.map(lang => (
                            <button
                                key={lang}
                                className={`language-button runnable ${selectedLanguage === lang ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang)}
                            >
                                {lang.toUpperCase()}
                                <span className="run-icon">▶</span>
                            </button>
                        ))}
                    </div>

                    <div className="language-selector">
                        <h4>보기 전용 언어:</h4>
                        {viewOnlyLanguages.map(lang => (
                            <button
                                key={lang}
                                className={`language-button view-only ${selectedLanguage === lang ? 'active' : ''}`}
                                onClick={() => handleLanguageChange(lang)}
                            >
                                {lang.toUpperCase()}
                                <span className="view-icon">👁</span>
                            </button>
                        ))}
                    </div>

                    {!isCurrentLanguageRunnable && (
                        <div className="info-message">
                            <p>📝 현재 선택된 언어는 코드 보기만 가능합니다.</p>
                        </div>
                    )}
                </div>
                <div className="demo-main-content">
                    <Editor 
                        ref={editorRef} 
                        activeFile={activeFile}
                        onChange={handleCodeChange}
                    />
                    <OutputConsole output={output} />
                </div>
            </div>
        </div>
    );
};

export default DemoIdePage;
