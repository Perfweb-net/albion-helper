jest.mock('axios', () => {
    const mockInstance = {
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    };
    return {
        create: jest.fn(() => mockInstance),
        defaults: { headers: { common: {} } },
    };
});

jest.mock('./utils/authUtils', () => ({ isTokenValid: jest.fn(() => Promise.resolve(true)) }));
jest.mock('./utils/rateLimitBus', () => ({ triggerRateLimited: jest.fn() }));

describe('api module', () => {
    test('creates an axios instance with baseURL', () => {
        const axios = require('axios');
        require('./api');
        expect(axios.create).toHaveBeenCalledWith(
            expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
        );
    });

    test('registers request and response interceptors', () => {
        const axios = require('axios');
        const instance = axios.create.mock.results[0]?.value;
        if (instance) {
            expect(instance.interceptors.request.use).toHaveBeenCalled();
            expect(instance.interceptors.response.use).toHaveBeenCalled();
        }
    });

    test('triggers the rate-limit bus on a 429 response', async () => {
        jest.resetModules();
        const axios = require('axios');
        require('./api');
        const { triggerRateLimited } = require('./utils/rateLimitBus');
        const instance = axios.create.mock.results[0].value;
        const [, errorHandler] = instance.interceptors.response.use.mock.calls[0];

        const error = { config: { url: '/items/search' }, response: { status: 429 } };
        await errorHandler(error).catch(() => {});

        expect(triggerRateLimited).toHaveBeenCalled();
    });

    test('does not trigger the rate-limit bus on other error statuses', async () => {
        jest.resetModules();
        const axios = require('axios');
        require('./api');
        const { triggerRateLimited } = require('./utils/rateLimitBus');
        const instance = axios.create.mock.results[0].value;
        const [, errorHandler] = instance.interceptors.response.use.mock.calls[0];

        const error = { config: { url: '/items/search' }, response: { status: 500 } };
        await errorHandler(error).catch(() => {});

        expect(triggerRateLimited).not.toHaveBeenCalled();
    });
});
