import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Guilds from './Guilds';

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
    api.get.mockResolvedValue({ data: { guilds: [] } });
});

test('renders without crashing', () => {
    render(<MemoryRouter><Guilds /></MemoryRouter>);
    expect(document.body).toBeInTheDocument();
});

test('calls API when search is submitted', async () => {
    render(<MemoryRouter><Guilds /></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'MyGuild' } });
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(api.get).toHaveBeenCalled());
});
