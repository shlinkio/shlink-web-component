import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';
import pack from './package.json';

const DEFAULT_NODE_VERSION = 'v22.10.0';
const nodeVersion = process.version ?? DEFAULT_NODE_VERSION;

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

  css: {
    preprocessorOptions: {
      scss: {
        // Silence annoying sass deprecation warnings until we get rid of bootstrap
        silenceDeprecations: ['mixed-decls', 'abs-percent', 'color-functions', 'global-builtin', 'import'],
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
    entries: [
      '@fortawesome/free-regular-svg-icons',
      'react-external-link',
      'compare-versions',
      '@shlinkio/shlink-js-sdk/api-contract',
      'qr-code-styling',
    ],
  },

  test: {
    globals: true,
    setupFiles: './test/setup.ts',
    reporters: [['default', { summary: false }]],
    // Run tests in an actual browser
    browser: {
      provider: 'playwright',
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
    // The bug can be reproduced in ^20.19 and in >=22.11
    alias: (nodeVersion >= 'v20.19.0' && nodeVersion < 'v21.0.0') || nodeVersion > DEFAULT_NODE_VERSION
      ? {
        'react-router': resolve(__dirname, 'node_modules/react-router/dist/development/index.mjs'),
      }
      : undefined,
  },
});
