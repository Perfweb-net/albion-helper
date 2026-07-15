import api from '../api';

// Les jetons vivent dans des cookies httpOnly : le front ne les voit jamais.
// La session s'observe via /api/me et se termine via /api/logout.

/**
 * Retourne l'identité de la session courante ({ username, roles })
 * ou null si aucune session n'est active.
 */
export const fetchSession = async () => {
    try {
        const response = await api.get('/me');
        return response.data;
    } catch {
        return null;
    }
};

/**
 * Termine la session : le back invalide le refresh token en base
 * et expire les deux cookies. Ne lève jamais (la déconnexion locale
 * doit aboutir même si l'API est injoignable).
 */
export const logout = async () => {
    try {
        await api.post('/logout');
    } catch {
        // session déjà expirée ou API indisponible : rien à faire
    }
};
