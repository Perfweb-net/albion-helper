import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Players from './Players';

jest.mock('../../api', () => ({ get: jest.fn() }));
jest.mock('../../components/PrivateRoute', () => ({
    isTokenValid: jest.fn(() => Promise.resolve(true)),
}));
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

import api from '../../api';

beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { players: [] } });
});

test('renders search input and button', () => {
    render(<MemoryRouter><Players /></MemoryRouter>);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
});

test('calls API on search submit', async () => {
    render(<MemoryRouter><Players /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hero' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('Hero')));
});

test('renders player results when API returns data', async () => {
    api.get.mockResolvedValueOnce({
        data: { players: [{ Id: '1', Name: 'Hero', GuildName: 'TestGuild', AllianceName: '', AverageItemPower: 1200 }] },
    });
    render(<MemoryRouter><Players /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hero' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Hero')).toBeInTheDocument());
});
