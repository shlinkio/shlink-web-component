import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import pack from './package.json';

const DEFAULT_NODE_VERSION = 'v22.10.0';
const nodeVersion = process.version ?? DEFAULT_NODE_VERSION;

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],

  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'api-contract': resolve(__dirname, 'src/api-contract/index.ts'),
        'settings': resolve(__dirname, 'src/settings/index.ts'),
      },
      name: 'shlink-web-component',
      formats: ['es'], // Generate ES module only
    },
    rollupOptions: {
      // Make sure dependencies and peer dependencies are not bundled with the library
      external: [...Object.keys(pack.dependencies), ...Object.keys(pack.peerDependencies), 'react/jsx-runtime'],
      output: {
        // This ensures generated CSS file is called index.css, not style.css
        assetFileNames: 'index.[ext]',
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
      },
    },

    // Silent warnings due to use of propTypes in reactstrap
    onConsoleLog: (log) => !log.includes('Support for defaultProps will be removed'),

    // Workaround for bug in react-router (or vitest module resolution) which causes different react-router versions to
    // be resolved for the main package and dependencies who have a peer dependency in react-router.
    // This ensures always the same version is resolved.
    // See https://github.com/remix-run/react-router/issues/12785 for details
    alias: nodeVersion > DEFAULT_NODE_VERSION
      ? {
        'react-router': resolve(__dirname, 'node_modules/react-router/dist/development/index.mjs'),
      }
      : undefined,
  },
});
