// Import custom matchers for Jest DOM assertions
import '@testing-library/jest-dom';
// Import Vitest mocking utilities
import { vi } from 'vitest';

// Mock Firebase module to avoid real network/database calls in tests
vi.mock('../lib/firebase', () => ({
  getProducts: vi.fn(() => Promise.resolve([])), // Mock getProducts to return empty array
  getProductById: vi.fn(() => Promise.resolve(null)), // Mock getProductById to return null
  addProduct: vi.fn(() => Promise.resolve(1)), // Mock addProduct to return 1
  deleteProduct: vi.fn(() => Promise.resolve()), // Mock deleteProduct to resolve
  db: {}, // Mock db object
}));

// Mock window.matchMedia for components using media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView to prevent errors in tests
Element.prototype.scrollIntoView = vi.fn();

// Mock Razorpay payment gateway as a class for tests
class MockRazorpay {
  open = vi.fn();
}
(globalThis as Record<string, unknown>).Razorpay = MockRazorpay;
