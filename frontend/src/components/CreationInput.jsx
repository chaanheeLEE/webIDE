import React, { useState, useEffect, useRef } from 'react';
import { VscFolder, VscFile } from 'react-icons/vsc';
import './FileExplorer.css'; // Reuse styles

const CreationInput = ({ type, onFinalize, onCancel }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onFinalize(name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Finalize on blur, even if the name is empty (which will be handled as a cancel)
    onFinalize(name);
  };

  return (
    <li className="tree-node creation-node">
      <span className="node-icon">
        {type === 'folder' ? <VscFolder /> : <VscFile />}
      </span>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="creation-input"
          placeholder={`Enter ${type} name...`}
        />
      </form>
    </li>
  );
};

export default CreationInput;
