/* eslint-disable @typescript-eslint/no-explicit-any */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { mockEventSource } from './mocks/mockEventSource';
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'node:crypto';
import { mockResizeObserver } from './mocks/mockResizeObserver';

mockEventSource();
mockResizeObserver();

process.env.REACT_APP_API_URL = 'localhost:4000';
process.env.REACT_APP_AUTHORITY = 'test-authority-url';
process.env.REACT_APP_CLIENT_ID = 'test-client-id';
process.env.REACT_APP_REDIRECT_URI = 'localhost:4000/auth/helsinki/return';
process.env.REACT_APP_API_TOKEN_GRANT_TYPE = 'test-grant';
process.env.REACT_APP_OPEN_ID_CONFIG = 'test-open-id-config';
process.env.REACT_APP_MAINTENANCE_MODE = 'false';

// remove specific test timeouts if this works
jest.setTimeout(15000);

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Provide a minimal crypto implementation so getRandomValues works in tests
if (!globalThis.crypto) {
  (globalThis as unknown as { crypto: Crypto }).crypto = webcrypto as Crypto;
}

module.exports = {
  testEnvironment: 'node',
};
