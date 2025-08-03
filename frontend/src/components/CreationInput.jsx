import React, { useState, useEffect, useRef } from 'react';
import { VscFolder, VscFile } from 'react-icons/vsc';
import './FileExplorer.css'; // Reuse styles

const CreationInput = ({ type, onFinalize, onCancel, siblings = [] }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const checkDuplicateName = (inputName) => {
    const trimmedName = inputName.trim();
    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return false;
    }

    // 안전한 중복 검증
    try {
      if (Array.isArray(siblings) && siblings.length > 0) {
        const isDuplicate = siblings.some(sibling => 
          sibling && sibling.name && 
          sibling.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
          setError('같은 이름의 파일 또는 폴더가 이미 존재합니다.');
          return false;
        }
      }
    } catch (e) {
      // 검증 오류 시에는 그냥 진행
    }

    setError('');
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (checkDuplicateName(name)) {
        onFinalize(name.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // 빈 이름일 경우 취소, 이름이 있을 경우에만 생성
    if (name.trim() && checkDuplicateName(name)) {
      onFinalize(name.trim());
    } else {
      onCancel();
    }
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
      {error && <div className="error-message">{error}</div>}
    </li>
  );
};

export default CreationInput;
