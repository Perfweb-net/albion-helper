import { triggerRateLimited, isRateLimited, subscribeRateLimited } from './rateLimitBus';

describe('rateLimitBus', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Repartir d'un état propre pour le test suivant : on laisse le cooldown s'écouler.
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('is not limited by default', () => {
        expect(isRateLimited()).toBe(false);
    });

    test('triggerRateLimited sets the flag and notifies subscribers', () => {
        const cb = jest.fn();
        const unsubscribe = subscribeRateLimited(cb);

        triggerRateLimited();

        expect(isRateLimited()).toBe(true);
        expect(cb).toHaveBeenCalledWith(true);
        unsubscribe();
    });

    test('resets automatically after the cooldown', () => {
        const cb = jest.fn();
        const unsubscribe = subscribeRateLimited(cb);

        triggerRateLimited();
        expect(isRateLimited()).toBe(true);

        jest.advanceTimersByTime(60_000);

        expect(isRateLimited()).toBe(false);
        expect(cb).toHaveBeenLastCalledWith(false);
        unsubscribe();
    });

    test('unsubscribe stops further notifications', () => {
        const cb = jest.fn();
        const unsubscribe = subscribeRateLimited(cb);
        unsubscribe();

        triggerRateLimited();
        jest.advanceTimersByTime(60_000);

        expect(cb).not.toHaveBeenCalled();
    });
});
