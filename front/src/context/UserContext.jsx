import { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);

    const decodeUser = (token) => {
        if (!token) { setUser(null); return; }
        try {
            const decoded = jwtDecode(token);
            setUser({ username: decoded.username, roles: decoded.roles || [] });
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLogin(true);
            decodeUser(token);
        }
    }, []);

    const handleSetIsLogin = (val) => {
        setIsLogin(val);
        if (val) {
            decodeUser(localStorage.getItem('token'));
        } else {
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ isLogin, setIsLogin: handleSetIsLogin, user }}>
            {children}
        </UserContext.Provider>
    );
};
