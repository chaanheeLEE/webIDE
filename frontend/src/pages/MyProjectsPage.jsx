import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiTrash2, FiEye, FiEyeOff, FiCalendar } from 'react-icons/fi';
import Header from '../components/Header';
import { getMyProjects, deleteProject, updateProjectPublishStatus } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import './MyProjectsPage.css';

const ProjectCard = ({ project, onEdit, onDelete, onTogglePublish }) => {
  const navigate = useNavigate();
  const [isPublished, setIsPublished] = useState(project.isPublished || false);

  const handleOpenProject = () => {
    navigate(`/ide/${project.id}`);
  };

  const handleTogglePublish = async () => {
    try {
      await onTogglePublish(project.id, !isPublished);
      setIsPublished(!isPublished);
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('공개 상태 변경에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-title" onClick={handleOpenProject}>
          {project.name}
        </h3>
        <div className="project-actions">
          <button
            className={`publish-toggle ${isPublished ? 'published' : 'private'}`}
            onClick={handleTogglePublish}
            title={isPublished ? '비공개로 변경' : '공개로 변경'}
          >
            {isPublished ? <FiEye /> : <FiEyeOff />}
          </button>
          <button
            className="edit-btn"
            onClick={() => onEdit(project)}
            title="프로젝트 편집"
          >
            <FiEdit3 />
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(project.id)}
            title="프로젝트 삭제"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      <p className="project-description">{project.description || '설명이 없습니다.'}</p>
      <div className="project-footer">
        <span className="project-date">
          <FiCalendar />
          {formatDate(project.updatedAt)}
        </span>
        <span className={`project-status ${isPublished ? 'public' : 'private'}`}>
          {isPublished ? '공개' : '비공개'}
        </span>
      </div>
    </div>
  );
};

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyProjects();
  }, [isAuthenticated, navigate]);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getMyProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project) => {
    // 프로젝트 편집 모달이나 페이지로 이동
    // 현재는 IDE 페이지로 이동
    navigate(`/ide/${project.id}`);
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      alert('프로젝트가 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  const handleTogglePublish = async (projectId, isPublished) => {
    try {
      await updateProjectPublishStatus(projectId, { isPublished });
      // 상태는 ProjectCard에서 관리됨
    } catch (error) {
      throw error; // ProjectCard에서 처리
    }
  };

  if (loading) {
    return (
      <div className="my-projects-container">
        <Header />
        <div className="loading">프로젝트 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="my-projects-container">
      <Header />
      <main className="my-projects-content">
        <div className="page-header">
          <h1>내 프로젝트</h1>
          <button 
            className="create-project-btn"
            onClick={() => navigate('/')}
          >
            새 프로젝트 생성
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {projects.length === 0 ? (
          <div className="empty-state">
            <h2>아직 프로젝트가 없습니다</h2>
            <p>새 프로젝트를 생성하여 시작해보세요!</p>
            <button 
              className="create-first-project-btn"
              onClick={() => navigate('/')}
            >
              첫 프로젝트 생성하기
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProjectsPage;
