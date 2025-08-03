import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { getLanguageForFile, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../languages';

const Editor = forwardRef(({ activeFile, onChange, isReadOnly = false }, ref) => {
  const [extensions, setExtensions] = useState([]);
  const editorRef = useRef();
  const defaultLang = SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];

  useImperativeHandle(ref, () => ({
    getValue: () => {
      // .editor.state 대신 .view.state를 사용하면 더 안정적입니다.
      return editorRef.current?.view?.state.doc.toString() || '';
    }
  }));

  // Load default language extension on initial mount
  useEffect(() => {
    defaultLang.loader().then(langExt => {
      setExtensions([langExt]);
    });
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      // Find language config based on file extension
      const langConfig = getLanguageForFile(activeFile?.name);
      
      let langExtension;
      try {
        if (langConfig) {
          // If a language is found, load its extension
          langExtension = await langConfig.loader();
        } else {
          // Otherwise, fall back to the default language
          langExtension = await defaultLang.loader();
        }
        setExtensions([langExtension]);
      } catch (err) {
        console.error(`Failed to load language for file: ${activeFile?.name}`, err);
        // On error, fall back to the default language
        const fallback = await defaultLang.loader();
        setExtensions([fallback]);
      }
    };

    if (activeFile?.name) {
      loadLanguage();
    } else {
      // If no file is active, ensure default language is set
      defaultLang.loader().then(langExt => setExtensions([langExt]));
    }
  }, [activeFile?.name]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isReadOnly && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#2d3748', 
          borderBottom: '1px solid #4a5568', 
          color: '#e2e8f0',
          fontSize: '14px'
        }}>
          🔒 읽기 전용 모드 - 파일을 수정할 수 없습니다
        </div>
      )}
      <CodeMirror
        ref={editorRef}
        value={activeFile?.content ?? 'Select a file to start editing.'}
        height="100%"
        extensions={extensions}
        onChange={!isReadOnly ? onChange : undefined}
        theme={oneDark}
        editable={!isReadOnly}
        style={{ flexGrow: 1, overflow: 'auto' }}
      />
    </div>
  );
});

export default Editor;
