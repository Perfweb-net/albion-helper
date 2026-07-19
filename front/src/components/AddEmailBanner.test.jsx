import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddEmailBanner from './AddEmailBanner';

jest.mock('../authApi', () => ({ get: jest.fn(), post: jest.fn() }));

// eslint-disable-next-line import/first
import api from '../authApi';

beforeEach(() => jest.clearAllMocks());

test('shows nothing when the account already has an email', async () => {
    api.get.mockResolvedValueOnce({ data: { email: 'user@example.com', pendingEmail: null } });
    const { container } = render(<AddEmailBanner />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/me'));
    expect(container).toBeEmptyDOMElement();
});

test('offers legacy accounts to add an email and confirms the sending', async () => {
    api.get.mockResolvedValueOnce({ data: { email: null, pendingEmail: null } });
    api.post.mockResolvedValueOnce({ data: { status: 'Verification email sent' } });
    render(<AddEmailBanner />);

    const input = await screen.findByLabelText(/saisissez votre adresse e-mail/i);
    fireEvent.change(input, { target: { value: 'legacy@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter cette adresse/i }));

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/profile/email', { email: 'legacy@example.com' });
        expect(screen.getByRole('status')).toHaveTextContent(/e-mail de confirmation envoyé/i);
    });
});

test('shows the API error when the address is rejected', async () => {
    api.get.mockResolvedValueOnce({ data: { email: null, pendingEmail: null } });
    api.post.mockRejectedValueOnce({ response: { data: { error: 'Email already in use' } } });
    render(<AddEmailBanner />);

    const input = await screen.findByLabelText(/saisissez votre adresse e-mail/i);
    fireEvent.change(input, { target: { value: 'taken@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter cette adresse/i }));

    // Le conteneur MUI info porte déjà role="alert" : on cible le texte de l'erreur
    await waitFor(() => expect(screen.getByText('Email already in use')).toBeInTheDocument());
});
