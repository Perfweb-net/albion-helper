import {createContext, useEffect, useState} from "react";

// Création du contexte utilisateur
export const UserContext = createContext();

// Provider qui englobe toute l'application
export const UserProvider = ({ children }) => {
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLogin(!!token);
    }, []);

    return (
        <UserContext.Provider value={{ isLogin, setIsLogin }}>
            {children}
        </UserContext.Provider>
    );
};
