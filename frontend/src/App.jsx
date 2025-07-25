import React, { useState } from "react";
import Editor from "./Editor";
import HELLO_WORLD_SNIPPETS from "./helloWorldSnippets";
import { DEFAULT_LANGUAGE } from "./languages";

function App() {
  const [value, setValue] = useState(HELLO_WORLD_SNIPPETS[DEFAULT_LANGUAGE]);
  const [output, setOutput] = useState("");
  const [filename, setFilename] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async (code) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, filename }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setOutput(result);
    } catch (e) {
      setOutput({ success: false, error: "에러 발생: " + e.message });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#222", padding: "24px" }}>
      <div style={{ color: "#fff" }}>Code Editor</div>
      <Editor
        value={value}
        setValue={setValue}
        onRun={handleRun}
        filename={filename}
        setFilename={setFilename}
        language={language}
        setLanguage={setLanguage}
        isLoading={isLoading}
      />
      <div style={{ color: '#fff', marginTop: 24, background: '#333', padding: 16, borderRadius: 8, minHeight: 80 }}>
        <b>실행 결과:</b>
        {output && typeof output === 'object' ? (
          <div>
            <div>성공 여부: <b style={{ color: output.success ? '#0f0' : '#f00' }}>{output.success ? '성공' : '실패'}</b></div>
            {output.output && (
              <div>출력: <pre style={{ color: '#0f0', margin: 0 }}>{output.output}</pre></div>
            )}
            {output.error && (
              <div>에러: <pre style={{ color: '#f66', margin: 0 }}>{output.error}</pre></div>
            )}
            {typeof output.executionTime === 'number' && (
              <div>실행 시간: <b>{output.executionTime} ms</b></div>
            )}
          </div>
        ) : (
          <pre style={{ color: '#0f0', margin: 0 }}>{output}</pre>
        )}
      </div>
    </div>
  );
}
export default App;