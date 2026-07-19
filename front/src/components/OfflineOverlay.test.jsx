import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import OfflineOverlay from './OfflineOverlay';

test('stays hidden while the browser is online', () => {
    const { container } = render(<OfflineOverlay />);
    expect(container).toBeEmptyDOMElement();
});

test('shows up when the connection is lost, hides when it comes back', () => {
    render(<OfflineOverlay />);

    act(() => {
        window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
        window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByRole('alert')).toBeNull();
});
