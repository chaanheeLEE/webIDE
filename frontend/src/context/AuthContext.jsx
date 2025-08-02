import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(() => {
        // 초기값을 localStorage에서 가져오기
        return localStorage.getItem('accessToken');
    });

    const login = (token) => {
        setAccessToken(token);
        localStorage.setItem('accessToken', token);
    };

    const logout = () => {
        setAccessToken(null);
        localStorage.removeItem('accessToken');
    };

    const isAuthenticated = !!accessToken;

    // localStorage와 상태 동기화
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token && !accessToken) {
            setAccessToken(token);
        }
    }, [accessToken]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
