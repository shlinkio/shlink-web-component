import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import pack from './package.json';

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ rollupTypes: true })],

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
      ignored: ['**/dist/**', '**/.idea/**', '**/node_modules/**', '**/.git/**', '**/test/**'],
    },
  },

  // Vitest recommended to add these dependencies here to avoid flaky tests
  optimizeDeps: {
    include: [
      '@formkit/drag-and-drop/react',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/react-fontawesome',
      '@json2csv/plainjs',
      '@testing-library/react',
      '@testing-library/user-event',
      '@shlinkio/data-manipulation',
      '@shlinkio/shlink-frontend-kit',
      '@shlinkio/shlink-js-sdk',
      '@shlinkio/shlink-js-sdk/api-contract',
      '@shlinkio/shlink-js-sdk/fetch',
      'axe-core',
      'bottlejs',
      'bowser',
      'clsx',
      'compare-versions',
      'date-fns',
      'event-source-polyfill',
      'history',
      'leaflet',
      'qr-code-styling',
      'react-dom/client',
      'react-external-link',
      'react-leaflet',
      'react-router',
      'react-swipeable',
      'recharts',
    ],
  },

  test: {
    globals: true,
    setupFiles: [
      './test/__helpers__/setup.ts',
      // Load styles in tests, as they affect how components look and behave, and are important for a11y contrast checks
      './dev/tailwind.css',
    ],

    // Propagate env vars from process.env, so that they can be accessed from tests
    env: process.env,

    // Run tests in an actual browser
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },

    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: [
        'src/**/*.ts',
        'src/**/*.tsx',
        '!src/index.ts',
        '!src/container/*',
        '!src/**/provideServices.ts',
        '!src/**/ChartDimensionsContext.ts',
      ],
      reporter: ['text', 'text-summary', 'clover', 'html'],

      // Required code coverage. Lower than this will make the check fail
      thresholds: {
        statements: 92,
        branches: 88,
        functions: 85,
        lines: 93,
      },
    },

    // Workaround for bug in react-router (or vitest module resolution) which causes different react-router versions to
    // be resolved for the main package and dependencies which have a peer dependency in react-router.
    // This ensures always the same version is resolved.
    // See https://github.com/remix-run/react-router/issues/12785 for details
    // The bug can be reproduced in ^20.19 and in >=22.11
    alias: {
      'react-router': resolve(__dirname, 'node_modules/react-router/dist/development/index.mjs'),
    },
  },
});
