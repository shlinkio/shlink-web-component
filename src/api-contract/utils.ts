import type { InvalidArgumentError, InvalidShortUrlDeletion, ProblemDetailsError } from '.';
import { ErrorType } from '.';

export const isInvalidArgumentError = (error?: ProblemDetailsError): error is InvalidArgumentError =>
  error?.type === ErrorType.INVALID_ARGUMENT;

export const isInvalidDeletionError = (error?: ProblemDetailsError): error is InvalidShortUrlDeletion =>
  error?.type === ErrorType.INVALID_SHORT_URL_DELETION;

const isProblemDetails = (e: unknown): e is ProblemDetailsError =>
  !!e && typeof e === 'object' && ['type', 'detail', 'title', 'status'].every((prop) => prop in e);

export const parseApiError = (e: unknown): ProblemDetailsError | undefined => (isProblemDetails(e) ? e : undefined);
