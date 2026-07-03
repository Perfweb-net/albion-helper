import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Dashboard from './Dashboard';

jest.mock('../../api', () => ({ get: jest.fn() }));
jest.mock('../../components/PrivateRoute', () => ({
    isTokenValid: jest.fn(() => Promise.resolve(true)),
}));
jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return { ...actual, useNavigate: () => jest.fn() };
});

const ctx = { isLogin: true, setIsLogin: jest.fn(), user: { username: 'test', roles: ['ROLE_USER'] } };

const renderDashboard = () =>
    render(
        <MemoryRouter>
            <UserContext.Provider value={ctx}>
                <Dashboard />
            </UserContext.Provider>
        </MemoryRouter>
    );

import api from '../../api';

beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { maps: [], players: [], guilds: [] } });
});

test('renders without crashing', () => {
    renderDashboard();
    expect(document.body).toBeInTheDocument();
});

test('has a search input', () => {
    renderDashboard();
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
});

test('submits search and calls API', async () => {
    renderDashboard();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'testplayer' } });

    const btn = screen.getByRole('button', { name: 'common.search' });
    fireEvent.click(btn);

    await waitFor(() => expect(api.get).toHaveBeenCalled());
});
