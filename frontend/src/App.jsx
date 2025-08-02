import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import IdePage from './pages/ide/IdePage';
import LoginPage from './pages/LoginPage';
import Mypage from './pages/Mypage';
import SignUpPage from './pages/SignUpPage';
import MyProjectsPage from './pages/MyProjectsPage';
import './index.css';
import { useAuth } from './context/AuthContext';
import setupInterceptors from './api/setupInterceptors';

const App = () => {
    const { isAuthenticated, login, logout } = useAuth();

    useEffect(() => {
        setupInterceptors({ login, logout });
    }, [login, logout]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/ide" element={<IdePage />} />
                <Route path="/ide/:projectId" element={<IdePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                    path="/my-projects"
                    element={isAuthenticated ? <MyProjectsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/mypage"
                    element={isAuthenticated ? <Mypage /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
};

export default App;