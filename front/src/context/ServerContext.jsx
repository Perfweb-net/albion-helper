import React, { createContext, useContext, useState, useCallback } from 'react';

// Serveurs de jeu Albion Online. Doit rester aligné avec App\Service\ServerRegion (back).
export const SERVERS = [
    { key: 'americas', label: 'Americas', flag: '🌎' },
    { key: 'europe', label: 'Europe', flag: '🌍' },
    { key: 'asia', label: 'Asia', flag: '🌏' },
];

const DEFAULT_SERVER = 'europe';
const ServerContext = createContext();

export const useServer = () => useContext(ServerContext);

export const ServerProvider = ({ children }) => {
    const [server, setServerState] = useState(() => {
        const stored = localStorage.getItem('albionServer');
        return SERVERS.some(s => s.key === stored) ? stored : DEFAULT_SERVER;
    });

    const setServer = useCallback((key) => {
        if (!SERVERS.some(s => s.key === key)) return;
        localStorage.setItem('albionServer', key);
        setServerState(key);
    }, []);

    const current = SERVERS.find(s => s.key === server) || SERVERS[1];

    return (
        <ServerContext.Provider value={{ server, setServer, current, servers: SERVERS }}>
            {children}
        </ServerContext.Provider>
    );
};
