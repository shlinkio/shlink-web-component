import type { ProblemDetailsError, ShlinkVisit, ShlinkVisitsParams } from '../../../api-contract';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';

export interface VisitsInfo {
  visits: ShlinkVisit[];
  loading: boolean;
  loadingLarge: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
  progress: number;
  cancelLoad: boolean;
  query?: ShlinkVisitsParams;
  fallbackInterval?: DateInterval;
}

export type VisitsDeletion = {
  deleting: boolean;
  error: boolean,
  errorData?: ProblemDetailsError;
};

export interface LoadVisits {
  query?: ShlinkVisitsParams;
  doIntervalFallback?: boolean;
}

export type VisitsLoaded<T = {}> = T & {
  visits: ShlinkVisit[];
  query?: ShlinkVisitsParams;
};
