import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

// Statically import JavaScript since it's a common default
import { javascript } from '@codemirror/lang-javascript';

const languageMap = {
  cpp: () => import('@codemirror/lang-cpp'),
  css: () => import('@codemirror/lang-css'),
  html: () => import('@codemirror/lang-html'),
  java: () => import('@codemirror/lang-java'),
  javascript: () => Promise.resolve({ javascript: () => javascript({ jsx: true }) }),
  jsx: () => Promise.resolve({ javascript: () => javascript({ jsx: true }) }),
  json: () => import('@codemirror/lang-json'),
  md: () => import('@codemirror/lang-markdown'),
  python: () => import('@codemirror/lang-python'),
  sql: () => import('@codemirror/lang-sql'),
  yaml: () => import('@codemirror/lang-yaml'),
  yml: () => import('@codemirror/lang-yaml'),
};

const Editor = ({ activeFile, onChange }) => {
  const [extensions, setExtensions] = useState([javascript({ jsx: true })]);

  useEffect(() => {
    if (activeFile?.name) {
      const extension = activeFile.name.split('.').pop();
      const langLoader = languageMap[extension];

      if (langLoader) {
        langLoader().then(langModule => {
          const langExtension = Object.values(langModule)[0]();
          setExtensions([langExtension]);
        }).catch(err => {
          console.error(`Failed to load language for extension: ${extension}`, err);
          // Fallback to javascript
          setExtensions([javascript({ jsx: true })]);
        });
      } else {
        // Fallback for unknown extensions
        setExtensions([javascript({ jsx: true })]);
      }
    }
  }, [activeFile?.name]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CodeMirror
        value={activeFile?.content || 'Select a file to start editing.'}
        height="100%"
        extensions={extensions}
        onChange={onChange}
        theme={oneDark}
        style={{ flexGrow: 1, overflow: 'auto' }}
      />
    </div>
  );
};

export default Editor;