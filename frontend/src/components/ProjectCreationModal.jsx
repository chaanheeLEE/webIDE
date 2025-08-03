import React, { useState } from 'react';
import { FiX, FiFolder } from 'react-icons/fi';
import './ProjectCreationModal.css';

const ProjectCreationModal = ({ isOpen, onClose, onCreate, isLoading = false }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = '프로젝트 이름을 입력해주세요.';
    } else if (projectName.trim().length < 2) {
      newErrors.projectName = '프로젝트 이름은 최소 2자 이상이어야 합니다.';
    } else if (projectName.trim().length > 50) {
      newErrors.projectName = '프로젝트 이름은 50자를 초과할 수 없습니다.';
    }

    if (description.length > 500) {
      newErrors.description = '프로젝트 설명은 500자를 초과할 수 없습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onCreate(projectName.trim(), description.trim());
  };

  const handleClose = () => {
    setProjectName('');
    setDescription('');
    setErrors({});
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FiFolder className="modal-icon" />
            <h2>새 프로젝트 생성</h2>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="projectName" className="form-label">
              프로젝트 이름 <span className="required">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`form-input ${errors.projectName ? 'error' : ''}`}
              placeholder="예: My Web Project"
              disabled={isLoading}
              autoFocus
            />
            {errors.projectName && (
              <span className="error-message">{errors.projectName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              프로젝트 설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="프로젝트에 대한 간단한 설명을 입력해주세요..."
              rows="4"
              disabled={isLoading}
            />
            <div className="character-count">
              {description.length}/500
            </div>
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !projectName.trim()}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  생성 중...
                </>
              ) : (
                '프로젝트 생성'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
