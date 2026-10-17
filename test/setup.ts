import { userEvent } from 'vitest/browser';

beforeEach(async () => {
  // Many tests which verify snapshots can produce different results depending on the order the tests are run, if a
  // different part is hovered.
  // Unhovering the document before every test reduces the impact a test can have on the next one.
  await userEvent.unhover(document.body);
});
