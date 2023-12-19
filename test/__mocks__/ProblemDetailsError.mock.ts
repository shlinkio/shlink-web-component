import type { ProblemDetailsError } from '../../src/api-contract';

export const problemDetailsError: Error & ProblemDetailsError = Object.assign(
  new Error('detail'),
  { type: 'bar', detail: 'detail', title: 'title', status: 400 },
);
