import { isTokenValid } from './authUtils';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

jest.mock('jwt-decode', () => ({ jwtDecode: jest.fn() }));
jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn(),
    create: jest.fn(() => ({ post: jest.fn(), get: jest.fn(), interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } })),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    defaults: { headers: { common: {} } },
}));

const now = Math.floor(Date.now() / 1000);

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

describe('isTokenValid', () => {
    test('returns false for null/undefined token', async () => {
        expect(await isTokenValid(null)).toBe(false);
        expect(await isTokenValid(undefined)).toBe(false);
        expect(await isTokenValid('')).toBe(false);
    });

    test('returns false when jwtDecode throws', async () => {
        jwtDecode.mockImplementation(() => { throw new Error('invalid token'); });
        expect(await isTokenValid('bad.token.here')).toBe(false);
    });

    test('returns true for a valid non-expiring token', async () => {
        jwtDecode.mockReturnValue({ exp: now + 3600 });
        expect(await isTokenValid('valid.token')).toBe(true);
    });

    test('returns false when token expired and no refreshToken in storage', async () => {
        jwtDecode.mockReturnValue({ exp: now - 10 });
        expect(await isTokenValid('expired.token')).toBe(false);
        expect(localStorage.getItem('token')).toBeNull();
    });

    test('returns false when token expiring soon (<5min) and no refreshToken', async () => {
        jwtDecode.mockReturnValue({ exp: now + 100 });
        expect(await isTokenValid('expiring.token')).toBe(false);
    });

    test('refreshes token when expired and refreshToken exists', async () => {
        jwtDecode.mockReturnValue({ exp: now - 10 });
        localStorage.setItem('refreshToken', 'old-refresh');
        axios.post.mockResolvedValueOnce({
            data: { token: 'new-token', refresh_token: 'new-refresh' },
        });

        const result = await isTokenValid('expired.token');
        expect(result).toBe(true);
        expect(localStorage.getItem('token')).toBe('new-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    test('returns false and clears tokens when refresh request fails', async () => {
        jwtDecode.mockReturnValue({ exp: now - 10 });
        localStorage.setItem('token', 'old-token');
        localStorage.setItem('refreshToken', 'old-refresh');
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        const result = await isTokenValid('expired.token');
        expect(result).toBe(false);
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });
});
