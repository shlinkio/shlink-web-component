import type { ProblemDetailsError, ShlinkVisit } from '../../../api-contract';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import type { VisitsQueryParams } from '../../types';

export type VisitsLoadingInfo = {
  loading: boolean;
  errorData: ProblemDetailsError | null;
  progress: number | null;
};

export interface VisitsInfo<QueryType extends VisitsQueryParams = VisitsQueryParams> extends VisitsLoadingInfo {
  visits: ShlinkVisit[];
  cancelLoad: boolean;
  query?: QueryType;
  fallbackInterval?: DateInterval;
}

export interface LoadVisits<QueryType extends VisitsQueryParams = VisitsQueryParams> {
  query?: QueryType;
  doIntervalFallback?: boolean;
}

export type VisitsLoaded<QueryType extends VisitsQueryParams = VisitsQueryParams, T = {}> = T & {
  visits: ShlinkVisit[];
  query?: QueryType;
};

export type VisitsDeletion = {
  deleting: boolean;
  error: boolean,
  errorData?: ProblemDetailsError;
};
