import React, { useState, useEffect } from 'react';
import './ProjectEditModal.css';

const ProjectEditModal = ({ isOpen, onClose, onSave, project, isLoading }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (project) {
            setName(project.name || '');
            setDescription(project.description || '');
        }
    }, [project]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        if (!name.trim()) {
            alert('프로젝트 이름은 비워둘 수 없습니다.');
            return;
        }
        onSave({ name, description });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>프로젝트 정보 수정</h2>
                <div className="form-group">
                    <label htmlFor="projectName">프로젝트 이름</label>
                    <input
                        id="projectName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="프로젝트 이름"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="projectDescription">설명</label>
                    <textarea
                        id="projectDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="프로젝트에 대한 간단한 설명"
                        rows="4"
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn" disabled={isLoading}>
                        취소
                    </button>
                    <button onClick={handleSave} className="save-btn" disabled={isLoading}>
                        {isLoading ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectEditModal;
