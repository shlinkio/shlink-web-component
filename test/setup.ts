import 'vitest-canvas-mock';
import 'chart.js/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import ResizeObserver from 'resize-observer-polyfill';
import { afterEach } from 'vitest';

// Clears all mocks and cleanup DOM after every test
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

(global as any).ResizeObserver = ResizeObserver;
(global as any).scrollTo = () => {};
(global as any).prompt = () => {};
(global as any).matchMedia = (media: string) => ({ matches: false, media });
(global as any).HTMLElement.prototype.scrollIntoView = () => {};
