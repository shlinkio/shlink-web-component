import type {
  InvalidArgumentError,
  InvalidShortUrlDeletion,
  ProblemDetailsError,
} from '.';
import {
  ErrorTypeV2,
  ErrorTypeV3,
} from '.';

export const isInvalidArgumentError = (error?: ProblemDetailsError): error is InvalidArgumentError =>
  error?.type === ErrorTypeV2.INVALID_ARGUMENT || error?.type === ErrorTypeV3.INVALID_ARGUMENT;

export const isInvalidDeletionError = (error?: ProblemDetailsError): error is InvalidShortUrlDeletion =>
  error?.type === 'INVALID_SHORTCODE_DELETION'
  || error?.type === ErrorTypeV2.INVALID_SHORT_URL_DELETION
  || error?.type === ErrorTypeV3.INVALID_SHORT_URL_DELETION;

const isProblemDetails = (e: unknown): e is ProblemDetailsError =>
  !!e && typeof e === 'object' && ['type', 'detail', 'title', 'status'].every((prop) => prop in e);

export const parseApiError = (e: unknown): ProblemDetailsError | undefined => (isProblemDetails(e) ? e : undefined);
