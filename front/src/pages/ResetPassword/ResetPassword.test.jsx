import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';

jest.mock('../../authApi', () => ({ post: jest.fn() }));

// eslint-disable-next-line import/first
import api from '../../authApi';

const renderPage = (initialEntry = '/reset-password?token=abc123') =>
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ResetPassword />
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
});

test('shows an error when the token is missing from the URL', () => {
    renderPage('/reset-password');
    expect(screen.getByRole('alert')).toHaveTextContent(/jeton de réinitialisation est manquant/i);
});

test('rejects mismatched passwords without calling the API', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/saisissez votre nouveau mot de passe/i), {
        target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmez votre nouveau mot de passe/i), {
        target: { value: 'different456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /valider/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/ne correspondent pas/i));
    expect(api.post).not.toHaveBeenCalled();
});

test('submits the new password with the token from the URL', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'Password updated' } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/saisissez votre nouveau mot de passe/i), {
        target: { value: 'newpassword456' },
    });
    fireEvent.change(screen.getByLabelText(/confirmez votre nouveau mot de passe/i), {
        target: { value: 'newpassword456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /valider/i }));

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/password/reset', { token: 'abc123', password: 'newpassword456' });
        expect(screen.getByRole('status')).toHaveTextContent(/mot de passe mis à jour/i);
    });
});

test('shows an error when the token is invalid or expired', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 400 } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/saisissez votre nouveau mot de passe/i), {
        target: { value: 'newpassword456' },
    });
    fireEvent.change(screen.getByLabelText(/confirmez votre nouveau mot de passe/i), {
        target: { value: 'newpassword456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /valider/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/invalide ou a expiré/i));
});
