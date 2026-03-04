// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Polyfill structuredClone for fake-indexeddb (not available in jsdom)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}

// Mock window.matchMedia
// NOTE: Use plain functions, not jest.fn() — CRA's jest config has resetMocks: true
// which calls mockReset() on all jest.fn() instances before each test, removing implementations.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
} as any;