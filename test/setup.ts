import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';
import ResizeObserver from 'resize-observer-polyfill';
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

HTMLCanvasElement.prototype.getContext = (() => {}) as any;

// Stuff JSDOM does not implement
(global as any).URL.createObjectURL = () => '';
(global as any).ResizeObserver = ResizeObserver;
(global as any).scrollTo = () => {};
(global as any).prompt = () => {};
(global as any).matchMedia = (media: string) => ({ matches: false, media });
(global as any).HTMLElement.prototype.scrollIntoView = () => {};
