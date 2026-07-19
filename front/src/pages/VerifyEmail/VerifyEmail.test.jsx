import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';

jest.mock('../../authApi', () => ({ post: jest.fn() }));

// eslint-disable-next-line import/first
import api from '../../authApi';

const renderPage = (initialEntry = '/verify-email?token=abc123') =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <VerifyEmail />
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
});

test('confirms the address with the token from the URL', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'Email verified' } });
    renderPage();

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/email/verify', { token: 'abc123' });
        expect(screen.getByRole('status')).toHaveTextContent(/compte est activé/i);
    });
});

test('shows an error for an invalid or used token', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 400 } });
    renderPage();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/invalide ou déjà utilisé/i));
});

test('shows an error when the token is missing', () => {
    renderPage('/verify-email');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
});
