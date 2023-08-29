import type { ErrorTypeV2, ErrorTypeV3, ProblemDetailsError } from '@shlinkio/shlink-js-sdk/api-contract';

// Re-export every type from the SDK
export * from '@shlinkio/shlink-js-sdk/api-contract';

export interface InvalidArgumentError extends ProblemDetailsError {
  type: ErrorTypeV2.INVALID_ARGUMENT | ErrorTypeV3.INVALID_ARGUMENT;
  invalidElements: string[];
}

export interface InvalidShortUrlDeletion extends ProblemDetailsError {
  type: 'INVALID_SHORTCODE_DELETION' | ErrorTypeV2.INVALID_SHORT_URL_DELETION | ErrorTypeV3.INVALID_SHORT_URL_DELETION;
  threshold: number;
}
