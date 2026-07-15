import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Login from './Login';

jest.mock('../../authApi', () => ({ post: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// eslint-disable-next-line import/first
import api from '../../authApi';

const renderLogin = (ctx = { isLogin: false, setIsLogin: jest.fn() }) =>
    render(
        <MemoryRouter>
            <UserContext.Provider value={ctx}>
                <Login />
            </UserContext.Provider>
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

test('renders login form', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
});

test('shows error alert on failed login', async () => {
    api.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/saisissez votre nom d'utilisateur/i), {
        target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText(/saisissez votre mot de passe/i), {
        target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
});

test('logs in via the API and navigates without storing any token client-side', async () => {
    // Les jetons sont posés en cookies httpOnly par l'API : la réponse est
    // volontairement ignorée par le front.
    api.post.mockResolvedValueOnce({ data: { token: 'ignored', refresh_token: 'ignored' } });
    const setIsLogin = jest.fn();
    renderLogin({ isLogin: false, setIsLogin });

    fireEvent.change(screen.getByLabelText(/saisissez votre nom d'utilisateur/i), {
        target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/saisissez votre mot de passe/i), {
        target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/login', { username: 'testuser', password: 'password123' });
        expect(setIsLogin).toHaveBeenCalledWith(true);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    // Aucun jeton ne doit exister côté JavaScript
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
});

test('redirects to dashboard when a session is already active', () => {
    renderLogin({ isLogin: true, setIsLogin: jest.fn() });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
