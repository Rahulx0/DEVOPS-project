import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  getProducts: vi.fn(() => Promise.resolve([])),
  getProductById: vi.fn(() => Promise.resolve(null)),
  addProduct: vi.fn(() => Promise.resolve(1)),
  deleteProduct: vi.fn(() => Promise.resolve()),
  db: {},
}));

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_FIREBASE_API_KEY: 'test-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: '1:123456789:web:abc123',
    VITE_NVIDIA_API_KEY: 'test-nvidia-key',
  },
});
