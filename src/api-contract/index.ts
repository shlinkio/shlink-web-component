import type { ErrorType, ProblemDetailsError } from '@shlinkio/shlink-js-sdk/api-contract';

// Re-export every type from the SDK
export * from '@shlinkio/shlink-js-sdk/api-contract';

export interface InvalidArgumentError extends ProblemDetailsError {
  type: typeof ErrorType.INVALID_ARGUMENT;
  invalidElements: string[];
}

export interface InvalidShortUrlDeletion extends ProblemDetailsError {
  type: typeof ErrorType.INVALID_SHORT_URL_DELETION;
  threshold: number;
}
