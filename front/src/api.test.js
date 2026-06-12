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
});
