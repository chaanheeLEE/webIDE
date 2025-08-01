import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import './SignUpPage.css';

const SignUpPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axiosInstance.post('/members/signup', { email, username, password });
            navigate('/login');
        } catch (err) {
            setError('Sign up failed. Please check your information.');
            console.error(err);
        }
    };

    return (
        <>
            <Header />
            <div className="signup-container">
                <form onSubmit={handleSubmit} className="signup-form">
                    <h2>Sign Up</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
            </div>
        </>
    );
};

export default SignUpPage;