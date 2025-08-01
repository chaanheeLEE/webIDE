import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import IdePage from './pages/ide/IdePage';
import LoginPage from './pages/LoginPage';
import Mypage from './pages/Mypage';
import SignUpPage from './pages/SignUpPage';
import './index.css';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('accessToken');

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/ide" element={<IdePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route
                    path="/mypage"
                    element={isAuthenticated ? <Mypage /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
};

export default App;