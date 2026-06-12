import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

jest.mock('../../authApi', () => ({ post: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// eslint-disable-next-line import/first
import api from '../../authApi';

const renderRegister = () =>
    render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    );

beforeEach(() => jest.clearAllMocks());

test('renders register form', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
});

test('shows error from API on registration failure', async () => {
    api.post.mockRejectedValueOnce({
        response: { data: { message: 'User already exists' } },
    });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/choisissez un nom d'utilisateur/i), {
        target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByLabelText(/choisissez un mot de passe sécurisé/i), {
        target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
});

test('navigates to login on successful registration', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'User created' } });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/choisissez un nom d'utilisateur/i), {
        target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByLabelText(/choisissez un mot de passe sécurisé/i), {
        target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
});
