import { renderHook, act } from '@testing-library/react';
import { useDebouncedSearch } from './useDebouncedSearch';
import { triggerRateLimited } from '../utils/rateLimitBus';

describe('useDebouncedSearch', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => jest.runOnlyPendingTimers());
        jest.useRealTimers();
    });

    test('does not search below minLength', () => {
        const onSearch = jest.fn();
        const { result } = renderHook(() => useDebouncedSearch(onSearch));

        act(() => result.current.setQuery('ep'));
        act(() => jest.advanceTimersByTime(1000));

        expect(onSearch).not.toHaveBeenCalled();
    });

    test('auto-searches once minLength is reached, after the debounce delay', () => {
        const onSearch = jest.fn();
        const { result } = renderHook(() => useDebouncedSearch(onSearch, { delay: 300 }));

        act(() => result.current.setQuery('epe'));
        act(() => jest.advanceTimersByTime(299));
        expect(onSearch).not.toHaveBeenCalled();

        act(() => jest.advanceTimersByTime(1));
        expect(onSearch).toHaveBeenCalledWith('epe');
    });

    test('triggerSearch fires immediately, bypassing the debounce and minLength', () => {
        const onSearch = jest.fn();
        const { result } = renderHook(() => useDebouncedSearch(onSearch));

        act(() => result.current.setQuery('a'));
        act(() => result.current.triggerSearch());

        expect(onSearch).toHaveBeenCalledWith('a');
    });

    test('stops auto-searching while rate limited, but triggerSearch still works', () => {
        const onSearch = jest.fn();
        const { result } = renderHook(() => useDebouncedSearch(onSearch, { delay: 100 }));

        act(() => triggerRateLimited());
        act(() => result.current.setQuery('epee'));
        act(() => jest.advanceTimersByTime(1000));

        expect(onSearch).not.toHaveBeenCalled();
        expect(result.current.rateLimited).toBe(true);

        act(() => result.current.triggerSearch());
        expect(onSearch).toHaveBeenCalledWith('epee');
    });
});
