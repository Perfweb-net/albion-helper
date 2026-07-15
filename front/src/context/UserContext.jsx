import { createContext, useCallback, useEffect, useState } from 'react';
import { fetchSession, logout as apiLogout } from '../utils/authUtils';

export const UserContext = createContext();

// Les jetons vivent dans des cookies httpOnly : la session s'observe en
// interrogeant /api/me (identité + rôles), jamais en décodant un jeton.
export const UserProvider = ({ children }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    const refreshSession = useCallback(async () => {
        const session = await fetchSession();
        setUser(session);
        setIsLogin(!!session);
        setSessionLoading(false);
        return session;
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    // Conserve la signature historique : setIsLogin(true) après un login
    // resynchronise la session ; setIsLogin(false) déconnecte réellement.
    const handleSetIsLogin = (val) => {
        if (val) {
            setIsLogin(true);
            refreshSession();
        } else {
            apiLogout();
            setIsLogin(false);
            setUser(null);
        }
    };

    return (
        <UserContext.Provider value={{ isLogin, setIsLogin: handleSetIsLogin, user, sessionLoading, refreshSession }}>
            {children}
        </UserContext.Provider>
    );
};
