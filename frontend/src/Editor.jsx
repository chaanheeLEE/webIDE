import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./languages";

function Editor({ value, setValue }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
  };

  const languageConfig = SUPPORTED_LANGUAGES[language];
  const extension = languageConfig.ext;
  const extensions = [
    basicSetup(), 
    typeof extension === 'function' ? extension() : extension,
  ];

  return (
    <div>
      <select value={language} onChange={handleLanguageChange}>
        {Object.entries(SUPPORTED_LANGUAGES).map(([key, config]) => (
          <option key={key} value={key}>
            {config.label}
          </option>
        ))}
      </select>
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
