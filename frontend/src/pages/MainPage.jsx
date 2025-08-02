import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiBox, FiUsers, FiTrendingUp } from 'react-icons/fi';
import Header from '../components/Header';
import ProjectCreationModal from '../components/ProjectCreationModal';
import { createProject } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import './MainPage.css';

const ProjectCard = ({ icon, title, description }) => (
    <div className="project-card">
        <div className="card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const HubProject = ({ team, title, description, progress, members }) => (
    <div className="hub-project-card">
        <div className="hub-project-header">
            <span className="team-name">{team}</span>
            <h4>{title}</h4>
        </div>
        <p className="hub-project-description">{description}</p>
        <div className="hub-project-footer">
            <div className="progress-bar">
                <div style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}%</span>
            <div className="member-avatars">{members}</div>
        </div>
    </div>
);


const MainPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleOpenModal = () => {
        console.log('isAuthenticated:', isAuthenticated); // 디버깅용
        if (isAuthenticated) {
            setIsModalOpen(true);
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsCreating(false);
    };

    const handleCreateProject = async (name, description) => {
        if (!name.trim()) {
            return; // 모달에서 이미 유효성 검사를 하므로 이 경우는 발생하지 않음
        }
        
        setIsCreating(true);
        try {
            const response = await createProject({
                projectName: name,
                description: description,
            });
            alert('프로젝트가 성공적으로 생성되었습니다.');
            setIsModalOpen(false);
            navigate(`/ide/${response.id}`);
        } catch (error) {
            console.error('Error creating project:', error);
            
            let errorMessage = '프로젝트 생성에 실패했습니다.';
            
            if (error.status === 401 || error.status === 403) {
                errorMessage = '로그인이 필요하거나 권한이 없습니다. 다시 로그인해주세요.';
            } else if (error.status === 500) {
                errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.status === 0) {
                errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleMyProjectsClick = () => {
        console.log('isAuthenticated:', isAuthenticated); // 디버깅용
        if (isAuthenticated) {
            navigate('/my-projects');
        } else {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    };

    return (
        <div className="main-page-container">
            <Header />
            <main className="main-content-area">
                <section className="project-management">
                    <h1>프로젝트 관리</h1>
                    <p>효율적인 프로젝트 관리로 팀의 생산성을 높이세요</p>
                    <div className="project-actions">
                        <button className="primary-button" onClick={handleOpenModal}>
                            <FiPlus /> 새 프로젝트 생성
                        </button>
                        <button className="secondary-button" onClick={handleMyProjectsClick}>개인 프로젝트</button>
                    </div>
                    <div className="project-cards-grid">
                        <ProjectCard icon={<FiBox />} title="빠른 시작" description="템플릿을 사용하여 몇 분 만에 프로젝트를 시작하세요" />
                        <ProjectCard icon={<FiUsers />} title="팀 협업" description="실시간으로 팀원들과 함께 작업하고 소통하세요" />
                        <ProjectCard icon={<FiTrendingUp />} title="진행 추적" description="프로젝트 진행 상황을 한눈에 파악하고 관리하세요" />
                    </div>
                </section>
                
                <ProjectCreationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onCreate={handleCreateProject}
                    isLoading={isCreating}
                />

                <section className="project-hub">
                    <h2>프로젝트 허브</h2>
                    <div className="hub-filters">
                        <button className="filter-active">공유된 프로젝트</button>
                        <button>내 프로젝트</button>
                        <button>즐겨찾기</button>
                        <button>최근 작업</button>
                    </div>
                    <div className="hub-projects-grid">
                        {/* Dummy Data */}
                        <HubProject team="마케팅 팀" title="웹사이트 리뉴얼" description="회사 웹사이트의 전면적인 리뉴얼 프로젝트입니다." progress={75} members={"👥"} />
                        <HubProject team="개발 팀" title="모바일 앱 개발" description="iOS 및 Android 네이ティブ 앱 개발 프로젝트입니다." progress={30} members={"👥"} />
                        <HubProject team="디자인 팀" title="브랜드 가이드라인" description="새로운 브랜드 아이덴티티 및 가이드라인 제작" progress={100} members={"👥"} />
                        <HubProject team="데이터 팀" title="데이터 분석 시스템" description="고객 데이터 분석을 위한 대시보드 구축 프로젝트" progress={60} members={"👥"} />
                        <HubProject team="고객 서비스 팀" title="고객 지원 시스템" description="효율적인 고객 지원을 위한 티켓팅 시스템 도입" progress={90} members={"👥"} />
                        <HubProject team="보안 팀" title="보안 강화 프로젝트" description="시스템 보안 강화 및 취약점 보완 프로젝트" progress={10} members={"👥"} />
                    </div>
                </section>
            </main>
            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-logo">ProjectHub</div>
                    <p>효율적인 프로젝트 관리와 팀 협업을 위한 최고의 솔루션입니다.</p>
                </div>
                <div className="footer-links">
                    <div><h4>제품</h4><Link to="#">기능</Link><Link to="#">가격</Link><Link to="#">템플릿</Link><Link to="#">통합</Link></div>
                    <div><h4>지원</h4><Link to="#">도움말 센터</Link><Link to="#">커뮤니티</Link><Link to="#">상태</Link></div>
                    <div><h4>회사</h4><Link to="#">소개</Link><Link to="#">블로그</Link><Link to="#">채용</Link><Link to="#">개인정보처리방침</Link></div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 ProjectHub. All rights reserved.</p>
                    <div className="social-icons">
                        <span>TW</span> <span>GH</span> <span>IN</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;
