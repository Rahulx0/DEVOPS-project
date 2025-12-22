// Import Node.js path module and Vite utilities
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Export Vite configuration
export default defineConfig(({ mode }) => {
    // Load environment variables for the current mode
    const env = loadEnv(mode, '.', '');
    return {
      // Dev server configuration
      server: {
        port: 5173, // Port for local dev server
        host: '0.0.0.0', // Listen on all interfaces
        proxy: {
          // Proxy API requests to NVIDIA API
          '/api/nvidia': {
            target: 'https://integrate.api.nvidia.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/nvidia/, ''),
            headers: {
              'Origin': 'https://integrate.api.nvidia.com'
            }
          }
        }
      },
      // Add React plugin
      plugins: [react()],
      // Define environment variables for client
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      // Path alias configuration
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Test configuration for Vitest
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'lcov', 'html'],
          reportsDirectory: './coverage',
          exclude: [
            'node_modules/',
            'src/test/',
            '**/*.d.ts',
            '**/*.config.*',
            '**/main.tsx',
            '**/index.tsx',
          ],
        },
      },
    };
});
