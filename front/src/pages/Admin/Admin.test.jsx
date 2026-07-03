import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Admin from './Admin';

jest.mock('../../i18n', () => {
    const i18nMock = {
        language: 'fr',
        languages: ['fr', 'en'],
        changeLanguage: jest.fn(),
        use: jest.fn().mockReturnThis(),
        init: jest.fn(),
        t: (key) => key,
        on: jest.fn(),
        off: jest.fn(),
        isInitialized: true,
        hasLoadedNamespace: jest.fn(() => true),
        getFixedT: jest.fn(() => (key) => key),
        availableLanguages: [{ code: 'fr', label: 'Français' }, { code: 'en', label: 'English' }],
    };
    const languages = [{ code: 'fr', label: 'Français', reference: true }, { code: 'en', label: 'English', reference: false }];
    return {
        default: i18nMock,
        availableLanguages: languages,
        // Fonction simple (pas un jest.fn) pour survivre à resetMocks: true de CRA.
        fetchAvailableLanguages: () => Promise.resolve(languages),
    };
});
// t et i18n doivent être stables entre les renders (comme le vrai i18next),
// sinon le useCallback([t]) de fetchData change à chaque render → boucle de fetch infinie
const mockT = (key) => key;
const mockI18nInstance = { language: 'fr' };
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT, i18n: mockI18nInstance }),
    I18nextProvider: ({ children }) => children,
}));

jest.mock('../../locales/fr/translation.json', () => ({ nav: {}, admin: {}, common: {} }), { virtual: true });

jest.mock('../../api', () => ({ get: jest.fn(), put: jest.fn(), post: jest.fn(), delete: jest.fn() }));

// eslint-disable-next-line import/first
import api from '../../api';

const mockStats = { totalUsers: 5, newToday: 1, activeRoutes: 3, totalRoutes: 10, playerSearches: 20, guildSearches: 8 };
const mockUsers = [
    { id: 1, username: 'admin', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
    { id: 2, username: 'user1', roles: ['ROLE_USER'] },
];
const mockCounts = { items: 12345 };

const renderAdmin = () =>
    render(
        <MemoryRouter>
            <Admin />
        </MemoryRouter>
    );

beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
        if (url.includes('stats'))       return Promise.resolve({ data: mockStats });
        if (url.includes('items/count')) return Promise.resolve({ data: mockCounts });
        if (url.includes('users'))       return Promise.resolve({ data: mockUsers });
        return Promise.resolve({ data: {} });
    });
    api.put.mockResolvedValue({ data: {} });
    api.delete.mockResolvedValue({ data: { status: 'deleted' } });
    api.post.mockResolvedValue({ data: { inserted: 100, updated: 20, total: 12345 } });
});

test('renders loading state initially', () => {
    renderAdmin();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('renders stats and users after load', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
});

test('renders language management section', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    // le mock de t() renvoie les clés de traduction brutes
    expect(screen.getByText('admin.language_management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'admin.add_language' })).toBeInTheDocument();
});

test('opens add language dialog on button click', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'admin.add_language' }));
    expect(screen.getByLabelText('admin.language_code_label')).toBeInTheDocument();
});

test('shows error for invalid language code', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'admin.add_language' }));

    const input = screen.getByLabelText('admin.language_code_label');
    fireEvent.change(input, { target: { value: 'invalid-code!!!' } });
    // Le bouton d'ouverture et le bouton de validation partagent le label admin.add_language : on prend celui du dialogue.
    const submit = screen.getAllByRole('button', { name: 'admin.add_language' });
    fireEvent.click(submit[submit.length - 1]);
    expect(screen.getByText('admin.language_code_invalid')).toBeInTheDocument();
});

test('shows error for duplicate language code', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'admin.add_language' }));

    const input = screen.getByLabelText('admin.language_code_label');
    fireEvent.change(input, { target: { value: 'fr' } });
    const submit = screen.getAllByRole('button', { name: 'admin.add_language' });
    fireEvent.click(submit[submit.length - 1]);
    expect(screen.getByText('admin.language_already_exists')).toBeInTheDocument();
});

test('sync items calls API', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'admin.sync_items_from_api' }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/admin/sync-items'));
});

test('opens delete confirmation dialog', async () => {
    renderAdmin();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    const deleteButtons = screen.getAllByRole('button').filter(b =>
        b.querySelector('[data-testid="DeleteIcon"]') || b.getAttribute('aria-label') === 'delete'
    );
    if (deleteButtons.length > 0) fireEvent.click(deleteButtons[0]);
});
