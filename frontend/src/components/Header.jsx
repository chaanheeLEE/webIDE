import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    // Determine if the header should be for the main site or the IDE
    const isIdeMode = location.pathname.startsWith('/ide');

    return (
        <header className={`app-header ${isIdeMode ? 'ide-header' : 'main-header'}`}>
            <div className="logo">
                <Link to="/">ProjectHub</Link>
            </div>
            <nav className="navigation">
                <Link to="/ide">OPEN IDE</Link>
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