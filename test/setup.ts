import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import axe from 'axe-core';
import ResizeObserver from 'resize-observer-polyfill';
import { afterEach } from 'vitest';

axe.configure({
  checks: [
    {
      // Disable color contrast checking, as it doesn't work in jsdom
      id: 'color-contrast',
      enabled: false,
    },
  ],
});

// Clears all mocks and cleanup DOM after every test
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

HTMLCanvasElement.prototype.getContext = (() => {}) as any;

(global as any).ResizeObserver = ResizeObserver;
(global as any).scrollTo = () => {};
(global as any).prompt = () => {};
(global as any).matchMedia = (media: string) => ({ matches: false, media });
(global as any).HTMLElement.prototype.scrollIntoView = () => {};
