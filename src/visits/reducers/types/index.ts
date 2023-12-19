import type { ProblemDetailsError, ShlinkVisit, ShlinkVisitsParams } from '../../../api-contract';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';

type VisitsParams = Omit<ShlinkVisitsParams, 'domain'>;

export interface VisitsInfo<QueryType extends VisitsParams = VisitsParams> {
  visits: ShlinkVisit[];
  loading: boolean;
  loadingLarge: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
  progress: number;
  cancelLoad: boolean;
  query?: QueryType;
  fallbackInterval?: DateInterval;
}

export interface LoadVisits<QueryType extends VisitsParams = VisitsParams> {
  query?: QueryType;
  doIntervalFallback?: boolean;
}

export type VisitsLoaded<QueryType extends VisitsParams = VisitsParams, T = {}> = T & {
  visits: ShlinkVisit[];
  query?: QueryType;
};

export type VisitsDeletion = {
  deleting: boolean;
  error: boolean,
  errorData?: ProblemDetailsError;
};
