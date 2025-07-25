import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";
import HELLO_WORLD_SNIPPETS from "./helloWorldSnippets";

const basic = basicSetup();

function Editor({ value, setValue, onRun, filename, setFilename, language, setLanguage, isLoading }) {
  // 상태 useState 제거

  // 확장자에 따라 언어 자동 변경
  const handleFilenameChange = (e) => {
    const newFilename = e.target.value;
    setFilename(newFilename);
    const extMatch = newFilename.match(/\.[^.]+$/);
    if (extMatch) {
      const ext = extMatch[0].toLowerCase();
      const found = Object.entries(SUPPORTED_LANGUAGES).find(([, config]) =>
        config.fileExtensions.includes(ext)
      );
      if (found) {
        setLanguage(found[0]);
      }
    }
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    if (HELLO_WORLD_SNIPPETS[selectedLanguage]) {
      setValue(HELLO_WORLD_SNIPPETS[selectedLanguage]);
    }
  };

  const languageConfig = SUPPORTED_LANGUAGES[language];
  const extension = languageConfig.ext;
  const extensions = [
    basic, 
    typeof extension === 'function' ? extension() : extension,
  ];

  return (
    <div>
      <div style={{ color: "#fff", marginBottom: 8 }}>
        파일명: <span style={{ fontWeight: "bold" }}>{filename || "없음"}</span>
      </div>
      <select value={language} onChange={handleLanguageChange}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([key, config]) => (
          <option key={key} value={key}>
            {config.label}
          </option>
        ))}
      </select>
      <button onClick={() => onRun && onRun(value)} disabled={isLoading} style={{ marginLeft: 8, padding: '4px 12px' }}>
        {isLoading ? '실행중...' : '실행'}
      </button>
      <CodeMirror
        value={value}
        height="500px"
        width="800px"
        extensions={extensions}
        onChange={setValue}
        theme="dark"
        style={{ fontSize: "16px", marginTop: 16 }}
      />
    </div>
  );
}
export default Editor;
