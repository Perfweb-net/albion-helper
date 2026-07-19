import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

test('auto-searches after 3 characters, like the other search screens', async () => {
    jest.useFakeTimers();
    renderDashboard();
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'ep' } });
    act(() => jest.advanceTimersByTime(1000));
    expect(api.get).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'epee' } });
    act(() => jest.advanceTimersByTime(1000));
    expect(api.get).toHaveBeenCalledWith('/player/search?pseudo=epee');
    jest.useRealTimers();
});

test('renders map results with colored chest dots (not Chip-styled)', async () => {
    api.get.mockResolvedValue({
        data: {
            maps: [{
                name: 'Qiitun-Odesos',
                tier: 8,
                zoneInfo: { markers: [{ name: 'Big Avalonian Chest' }, { name: 'Solo Chest' }] },
            }],
        },
    });
    renderDashboard();

    const input = screen.getByRole('textbox');
    fireEvent.mouseDown(screen.getByLabelText('dashboard.search_type_label'));
    fireEvent.click(screen.getByText('dashboard.menu_map'));
    fireEvent.change(input, { target: { value: 'Qiitun' } });
    fireEvent.click(screen.getByRole('button', { name: 'common.search' }));

    await screen.findByText('Qiitun-Odesos');
    const dots = document.querySelectorAll('[data-testid="CircleIcon"]');
    expect(dots.length).toBe(2);
    // La pastille ne doit plus être dans un Chip MUI, dont le style interne
    // écrasait la couleur (pastilles blanches en thème sombre)
    dots.forEach((dot) => expect(dot.closest('.MuiChip-root')).toBeNull());
});
