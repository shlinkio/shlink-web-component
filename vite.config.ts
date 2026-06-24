import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import pack from './package.json';

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      compilerOptions: { rootDir: 'src' },
      exclude: ['test', 'dev'],
    }),
  ],

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
    rolldownOptions: {
      // Make sure dependencies and peer dependencies are not bundled with the library
      external: [...Object.keys(pack.dependencies), ...Object.keys(pack.peerDependencies), 'react/jsx-runtime'],
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

    // Propagate env vars from process.env, so that they can be accessed from tests via import.meta.env
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
  },
});
