import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from '../theme';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');

    const toggleTheme = () => {
        setMode(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('themeMode', next);
            return next;
        });
    };

    const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);

    // Expose le mode aux feuilles .scss (custom properties de src/styles/variables.scss)
    useEffect(() => {
        document.body.dataset.theme = mode;
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
