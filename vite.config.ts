import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import pack from './package.json';

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'api-contract': resolve(__dirname, 'src/api-contract/index.ts'),
      },
      name: 'shlink-web-component'
    },
    rollupOptions: {
      external: [...Object.keys(pack.peerDependencies ?? {}), 'react/jsx-runtime'],
      output: {
        assetFileNames: "index.[ext]",
      },
    },
  },

  server: {
    watch: {
      ignored: ['**/home/**', '**/dist/**', '**/.idea/**', '**/node_modules/**', '**/.git/**'],
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    allowOnly: true,
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        '!src/index.ts',
        '!src/container/*',
        '!src/**/provideServices.ts',
      ],
      reporter: ['text', 'text-summary', 'clover', 'html'],

      // Required code coverage. Lower than this will make the check fail
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 85,
        lines: 95,
      }
    },
  },
});
