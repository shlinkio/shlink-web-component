import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';
import { beforeEach } from 'vitest';

axe.configure({
  checks: [
    {
      // Disable color contrast checking, as it doesn't work in jsdom
      id: 'color-contrast',
      enabled: false,
    },
  ],
});

// Clears all mocks before every test
beforeEach(() => {
  vi.clearAllMocks();
});
