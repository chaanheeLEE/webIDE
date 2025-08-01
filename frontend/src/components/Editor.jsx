import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLanguageForFile, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../languages';

const Editor = ({ activeFile, onChange }) => {
  const [extensions, setExtensions] = useState([]);
  const defaultLang = SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];

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
      <CodeMirror
        value={activeFile?.content ?? 'Select a file to start editing.'}
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
