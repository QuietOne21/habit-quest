import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem('hq_token')
    );

    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hq_user');
        return saved ? JSON.parse(saved) : null;
    });

    const loginUser = (newToken, userData) => {
        localStorage.setItem('hq_token', newToken);
        localStorage.setItem('hq_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('hq_token');
        localStorage.removeItem('hq_user');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (user?.expiresAt) {
            const expiry = new Date(user.expiresAt);
            if (expiry < new Date()) {
                logout();
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ token, user, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}