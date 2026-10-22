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
import { mockScrollIntoView } from './mocks/mockScrollIntoView';

mockEventSource();
mockResizeObserver();
mockScrollIntoView();

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

// Needed for React 18 so async updates are treated as act-aware in tests.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Some console warnings are possible in tests, but they can clutter the output.
// This code overrides console.error to ignore specific warnings that are known and not relevant to the tests.
const ignoredConsoleErrors = [
  'Warning: The current testing environment is not configured to support act(...)',
];

const normalizeConsoleArg = (arg: unknown): string => {
  if (typeof arg === 'string') return arg;
  if (arg == null) return '';
  if (arg instanceof Error) return arg.message;
  if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint') {
    return `${arg}`;
  }
  if (typeof arg === 'symbol') return arg.description ?? '';

  try {
    return JSON.stringify(arg);
  } catch {
    return '';
  }
};

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const allArgs = args.map(normalizeConsoleArg).join(' ');

  const isAuthProviderActWarning =
    allArgs.includes('inside a test was not wrapped in act(...)') &&
    allArgs.includes('AuthProvider');

  if (isAuthProviderActWarning || ignoredConsoleErrors.some((msg) => allArgs.includes(msg))) {
    return;
  }
  originalConsoleError(...args);
};

const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
  const message = typeof warning === 'string' ? warning : warning?.message;
  if (typeof message === 'string' && message.includes('punycode')) {
    return;
  }

  originalEmitWarning(warning as never, ...(args as never[]));
}) as typeof process.emitWarning;

const originalStyleAppendChild = HTMLStyleElement.prototype.appendChild;
HTMLStyleElement.prototype.appendChild = function <T extends Node>(newChild: T): T {
  if (
    newChild.nodeType === Node.TEXT_NODE &&
    typeof newChild.textContent === 'string' &&
    newChild.textContent.includes('hds-')
  ) {
    // hds-react injects large runtime CSS blocks that jsdom cannot parse reliably.
    return newChild;
  }

  return originalStyleAppendChild.call(this, newChild) as T;
};

module.exports = {
  testEnvironment: 'node',
};
