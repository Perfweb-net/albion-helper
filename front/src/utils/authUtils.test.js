import { fetchSession, logout } from './authUtils';
import api from '../api';

jest.mock('../api', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('fetchSession', () => {
    test('interroge /me pour observer la session', async () => {
        api.get.mockResolvedValueOnce({ data: { username: 'alice', roles: ['ROLE_USER'] } });
        await fetchSession();
        expect(api.get).toHaveBeenCalledWith('/me');
    });

    test("retourne l'identité (username + roles) quand une session est active", async () => {
        api.get.mockResolvedValueOnce({ data: { username: 'alice', roles: ['ROLE_USER', 'ROLE_ADMIN'] } });
        const session = await fetchSession();
        expect(session).toEqual({ username: 'alice', roles: ['ROLE_USER', 'ROLE_ADMIN'] });
    });

    test('retourne null pour un visiteur anonyme (401)', async () => {
        api.get.mockRejectedValueOnce({ response: { status: 401 } });
        expect(await fetchSession()).toBeNull();
    });

    test('retourne null en cas d\'erreur réseau (API injoignable)', async () => {
        api.get.mockRejectedValueOnce(new Error('Network error'));
        expect(await fetchSession()).toBeNull();
    });

    test('ne stocke jamais rien dans localStorage (jetons httpOnly côté serveur)', async () => {
        api.get.mockResolvedValueOnce({ data: { username: 'alice', roles: [] } });
        await fetchSession();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });
});

describe('logout', () => {
    test('demande au back d\'invalider la session (POST /logout)', async () => {
        api.post.mockResolvedValueOnce({ data: { status: 'Logged out' } });
        await logout();
        expect(api.post).toHaveBeenCalledWith('/logout');
    });

    test('aboutit silencieusement même si l\'API est injoignable', async () => {
        api.post.mockRejectedValueOnce(new Error('Network error'));
        await expect(logout()).resolves.toBeUndefined();
    });
});
