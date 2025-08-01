import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import './Mypage.css';
import jwtDecode from 'jwt-decode'; // Use a named import

const Mypage = () => {
    const [currentUser, setCurrentUser] = useState({ email: '', username: '' });
    const [newUsername, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUser({ email: decoded.sub, username: decoded.username });
            } catch (e) {
                console.error("Invalid token", e);
                setError("Invalid session. Please log in again.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                delete axiosInstance.defaults.headers.common['Authorization'];
                window.location.href = '/login'; // 강제 로그인 페이지 이동
            }
        }
    }, []);

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await axiosInstance.patch('/members/username', { newUsername });
            setCurrentUser(response.data);
            setNewUsername('');
            setSuccess('Username changed successfully!');
        } catch (err) {
            setError('Failed to change username. It might be taken.');
            console.error(err);
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }
        try {
            await axiosInstance.delete('/members', {
                data: { password }
            });
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            delete axiosInstance.defaults.headers.common['Authorization'];
            window.location.href = '/login'; // Redirect to login after deletion
        } catch (err) {
            setError('Failed to delete account. Please check your password.');
            console.error(err);
        }
    };

    return (
        <div className="mypage-container">
            <h1>My Page</h1>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="user-info">
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Username:</strong> {currentUser.username}</p>
            </div>

            <div className="form-section">
                <h2>Change Username</h2>
                <form onSubmit={handleChangeUsername}>
                    <div className="form-group">
                        <label htmlFor="newUsername">New Username</label>
                        <input
                            type="text"
                            id="newUsername"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="action-button">Change Username</button>
                </form>
            </div>

            <div className="form-section">
                <h2>Delete Account</h2>
                <form onSubmit={handleDeleteAccount}>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="action-button delete-button">Delete Account</button>
                </form>
            </div>
        </div>
    );
};

export default Mypage;
