import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Login from './Login';

jest.mock('../../authApi', () => ({ post: jest.fn() }));
jest.mock('../../components/PrivateRoute', () => ({
    isTokenValid: jest.fn(() => Promise.resolve(false)),
}));

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

test('stores token and navigates to dashboard on success', async () => {
    api.post.mockResolvedValueOnce({
        data: { token: 'fake-jwt', refresh_token: 'fake-refresh' },
    });
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
        expect(localStorage.getItem('token')).toBe('fake-jwt');
        expect(setIsLogin).toHaveBeenCalledWith(true);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
});
