import type { ProblemDetailsError } from '../api-contract';
import { isInvalidArgumentError } from '../api-contract/utils';

export interface ShlinkApiErrorProps {
  errorData?: ProblemDetailsError;
  fallbackMessage?: string;
}

export const ShlinkApiError = ({ errorData, fallbackMessage }: ShlinkApiErrorProps) => (
  <>
    {errorData?.detail ?? fallbackMessage}
    {isInvalidArgumentError(errorData) && <p>Invalid elements: [{errorData.invalidElements.join(', ')}]</p>}
  </>
);
