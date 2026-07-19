import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

test('renders the 404 page with a link back home', () => {
    render(
        <MemoryRouter initialEntries={['/une-route-inconnue']}>
            <NotFound />
        </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
});
