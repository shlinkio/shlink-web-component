import type { ProblemDetailsError, ShlinkVisit } from '../../../api-contract';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import type { VisitsQueryParams } from '../../types';

export type VisitsLoadingInfo = {
  loading: boolean;
  errorData: ProblemDetailsError | null;
  progress: number | null;
};

export type VisitsInfo<QueryType extends VisitsQueryParams = VisitsQueryParams> = VisitsLoadingInfo & {
  visits: ShlinkVisit[];
  prevVisits?: ShlinkVisit[];
  cancelLoad: boolean;
  query?: QueryType;
  fallbackInterval?: DateInterval;
};

export type GetVisitsOptions = {
  doIntervalFallback?: boolean;
  loadPrevInterval?: boolean;
};

export type LoadVisits<QueryType extends VisitsQueryParams = VisitsQueryParams> = GetVisitsOptions & {
  query?: QueryType;
};

export type VisitsLoaded<QueryType extends VisitsQueryParams = VisitsQueryParams, T = {}> = T & {
  visits: ShlinkVisit[];
  query?: QueryType;
};

export type VisitsDeletion = {
  deleting: boolean;
  error: boolean,
  errorData?: ProblemDetailsError;
};
