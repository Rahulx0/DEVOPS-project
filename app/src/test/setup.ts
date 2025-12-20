import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  getProducts: vi.fn(() => Promise.resolve([])),
  getProductById: vi.fn(() => Promise.resolve(null)),
  addProduct: vi.fn(() => Promise.resolve(1)),
  deleteProduct: vi.fn(() => Promise.resolve()),
  db: {},
}));

// Mock window.matchMedia
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

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock Razorpay as a class
class MockRazorpay {
  open = vi.fn();
}
(globalThis as Record<string, unknown>).Razorpay = MockRazorpay;
