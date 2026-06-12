import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// React Router v7 requires TextEncoder (not available in jsdom 16)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
