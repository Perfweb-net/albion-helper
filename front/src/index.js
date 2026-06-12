import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AllContext from './context/AllContext';
import { ThemeModeProvider } from './context/ThemeContext';
import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeModeProvider>
            <AllContext>
                <App />
            </AllContext>
        </ThemeModeProvider>
    </React.StrictMode>
);

reportWebVitals();
