import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './Header.css';
import { useAuth } from '../context/AuthContext';

const Header = ({ onRunCode, isRunning, isRunDisabled = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/members/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            logout();
            delete axiosInstance.defaults.headers.common['Authorization'];
            navigate('/login');
        }
    };

    // Determine if the header should be for the main site or the IDE
    const isIdeMode = location.pathname.startsWith('/ide') || location.pathname.startsWith('/demo-ide');

    return (
        <header className={`app-header ${isIdeMode ? 'ide-header' : 'main-header'}`}>
            <div className="logo">
                <Link to="/">ProjectHub</Link>
            </div>
            {isIdeMode && (
                <div className="ide-controls">
                    <button 
                        onClick={onRunCode} 
                        className="run-button" 
                        disabled={isRunning || isRunDisabled}
                        title={isRunDisabled ? "현재 언어는 실행할 수 없습니다" : ""}
                    >
                        {isRunning ? '실행 중...' : 'Run'}
                    </button>
                </div>
            )}
            <nav className="navigation">
                {!isIdeMode && <Link to="/demo-ide">OPEN IDE</Link>}
                {isAuthenticated ? (
                    <>
                        <Link to="/mypage">My Page</Link>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="login-button">Login</Link>
                        <Link to="/signup" className="signup-button">Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;