// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { mockEventSource } from './mocks/mockEventSource';

mockEventSource();

process.env.REACT_APP_API_URL = 'localhost:4000';
process.env.REACT_APP_AUTHORITY = 'test-authority-url';
process.env.REACT_APP_CLIENT_ID = 'test-client-id';
process.env.REACT_APP_REDIRECT_URI = 'localhost:4000/auth/helsinki/return';
process.env.REACT_APP_API_TOKEN_GRANT_TYPE = 'test-grant';
process.env.REACT_APP_OPEN_ID_CONFIG = 'test-open-id-config';

// remove specific test timeouts if this works
jest.setTimeout(10000);
