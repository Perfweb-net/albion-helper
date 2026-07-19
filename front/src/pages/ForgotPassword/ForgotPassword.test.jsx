import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

jest.mock('../../authApi', () => ({ post: jest.fn() }));

// eslint-disable-next-line import/first
import api from '../../authApi';

const renderPage = () =>
    render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
});

test('renders forgot password form', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument();
});

test('sends the email to the API and shows the generic confirmation', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'ok' } });
    renderPage();

    fireEvent.change(screen.getByLabelText(/saisissez votre adresse e-mail/i), {
        target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/password/forgot', { email: 'user@example.com' });
        // Message générique : ne révèle pas si le compte existe
        expect(screen.getByRole('status')).toHaveTextContent(/si cette adresse est liée à un compte/i);
    });
});

test('shows an error alert when the request fails', async () => {
    api.post.mockRejectedValueOnce(new Error('network'));
    renderPage();

    fireEvent.change(screen.getByLabelText(/saisissez votre adresse e-mail/i), {
        target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
});
