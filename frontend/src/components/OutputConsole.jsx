import React, { useState } from 'react';
import './OutputConsole.css';

const OutputConsole = ({ output }) => {
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      // This functionality is not fully implemented yet.
      // In a real app, this would send the input to the running process.
      console.log('Input submitted:', input);
      setInput('');
    }
  };

  return (
    <div className="output-console">
      <div className="console-tabs">
        <button className="tab-item active">Output</button>
        <button className="tab-item">Debug Console</button>
        <button className="tab-item">Terminal</button>
      </div>
      <div className="console-content">
        <pre className="output-area">{output || '실행 결과가 여기에 표시됩니다.'}</pre>
        <div className="input-area">
          <span>&gt;</span>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your input here..."
          />
        </div>
      </div>
    </div>
  );
};

export default OutputConsole;
