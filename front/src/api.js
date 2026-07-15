import axios from 'axios';

// L'authentification vit dans des cookies httpOnly posés par l'API :
// aucun jeton n'est lisible (ni stocké) côté JavaScript.
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Serveur de jeu courant (americas/europe/asia) — lu par le back (X-Albion-Server)
        config.headers['X-Albion-Server'] = localStorage.getItem('albionServer') || 'europe';
        return config;
    },
    (error) => Promise.reject(error)
);

const isAuthCall = (url = '') =>
    url.includes('/login') || url.includes('/register') || url.includes('token/refresh') || url.includes('/logout');

// La sonde de session (/me) échoue légitimement pour un visiteur anonyme :
// elle ne doit jamais provoquer de redirection.
const isSessionProbe = (url = '') => url.includes('/me');

api.interceptors.response.use(
    response => response,
    async (error) => {
        const { config, response } = error;
        const url = config?.url || '';

        // Ne pas rediriger pour les échecs d'authentification eux-mêmes (mauvais identifiants,
        // inscription refusée) : la page doit afficher l'erreur à l'utilisateur.
        if (isAuthCall(url)) {
            return Promise.reject(error);
        }

        // Jeton d'accès expiré : on tente une fois le refresh (cookie httpOnly),
        // puis on rejoue la requête d'origine.
        if (response?.status === 401 && config && !config._retried) {
            config._retried = true;
            try {
                await api.post('/token/refresh');
                return api(config);
            } catch {
                if (!isSessionProbe(url)) {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }

        if ((response?.status === 401 || response?.status === 403) && !isSessionProbe(url)) {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
