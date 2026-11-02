import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: 'REACT_APP_',
  resolve: {
    alias: {
      '@': src,
    },
  },
  server: {
    host: true,
    port: 4000,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4000,
    strictPort: true,
  },
  build: {
    outDir: 'build',
    // Single bundle (incl. @react-pdf) until code splitting is addressed separately.
    chunkSizeWarningLimit: 4000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    mockReset: true,
    testTimeout: 15000,
    server: {
      deps: {
        inline: ['react-router', 'react-router-dom'],
      },
    },
    css: {
      modules: {
        // Unhashed class names, matching CRA's identity-obj-proxy behaviour.
        classNameStrategy: 'non-scoped',
      },
    },
    alias: {
      '@react-pdf/renderer': `${src}/testUtils/reactPdfRendererMock.tsx`,
      // Its "node" export is CJS only, which would load a second react-router copy next to the ESM one.
      'react-router-dom': fileURLToPath(
        new URL('./node_modules/react-router-dom/dist/index.mjs', import.meta.url),
      ),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/mocks/**', 'src/setupTests.ts'],
    },
  },
});
