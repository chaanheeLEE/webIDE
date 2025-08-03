import React, { useState, useEffect } from 'react';
import { getMemberInfo, updateUsername, updatePassword, deleteMember } from '../api/memberApi';
import { useAuth } from '../context/AuthContext';
import { handleApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './Mypage.css';

const Mypage = () => {
    const [currentUser, setCurrentUser] = useState({ email: '', username: '' });
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getMemberInfo();
                setCurrentUser(userInfo);
                setNewUsername(userInfo.username);
            } catch (err) {
                handleApiError(err, logout, navigate);
            }
        };
        fetchUserInfo();
    }, [logout, navigate]);

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newUsername === currentUser.username) {
            setError('새 사용자 이름이 현재 이름과 동일합니다.');
            return;
        }
        try {
            await updateUsername(newUsername);
            setCurrentUser(prev => ({ ...prev, username: newUsername }));
            setSuccess('사용자 이름이 성공적으로 변경되었습니다!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(handleApiError(err, logout, navigate));
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmNewPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (newPassword.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        try {
            await updatePassword(currentPassword, newPassword);
            setSuccess('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(handleApiError(err, logout, navigate));
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!deletePassword) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        const confirmDelete = window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
        if (!confirmDelete) {
            return;
        }

        try {
            await deleteMember(deletePassword);
            alert('계정이 성공적으로 삭제되었습니다.');
            logout();
            navigate('/');
        } catch (err) {
            setError(handleApiError(err, logout, navigate));
        }
    };

    return (
        <>
            <Header />
            <div className="mypage-container">
                <h1>마이페이지</h1>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

            <div className="user-info">
                <p><strong>이메일:</strong> {currentUser.email}</p>
                <p><strong>사용자 이름:</strong> {currentUser.username}</p>
            </div>

            <div className="form-section">
                <h2>사용자 이름 변경</h2>
                <form onSubmit={handleChangeUsername}>
                    <div className="form-group">
                        <label htmlFor="newUsername">새 사용자 이름</label>
                        <input
                            type="text"
                            id="newUsername"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="action-button">이름 변경</button>
                </form>
            </div>

            <div className="form-section">
                <h2>비밀번호 변경</h2>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">현재 비밀번호</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="action-button">비밀번호 변경</button>
                </form>
            </div>

            <div className="form-section danger-zone">
                <h2>회원탈퇴</h2>
                <p className="warning-text">
                    계정을 삭제하면 모든 프로젝트와 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <form onSubmit={handleDeleteAccount}>
                    <div className="form-group">
                        <label htmlFor="deletePassword">비밀번호 확인</label>
                        <input
                            type="password"
                            id="deletePassword"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="계정 삭제를 위해 비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: '1px solid #dc3545',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                        계정 삭제
                    </button>
                </form>
            </div>
        </div>
        </>
    );
};

export default Mypage;
