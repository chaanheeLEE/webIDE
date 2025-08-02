import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);

    const login = (token) => {
        setAccessToken(token);
    };

    const logout = () => {
        setAccessToken(null);
    };

    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
