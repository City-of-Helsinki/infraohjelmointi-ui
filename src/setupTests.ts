// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock CSS modules
const mockCssModule = new Proxy(
  {},
  {
    get: function getter(target, key) {
      // Return the property name as the value
      return key;
    },
  },
);

// Mock style imports
jest.mock('*.module.css', () => mockCssModule);
jest.mock('*.css', () => ({}));

// Suppress CSS parsing errors in console
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Could not parse CSS stylesheet') ||
      args[0].includes('Error: Could not parse CSS stylesheet'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
