import type { ProblemDetailsError, ShlinkVisit } from '../../../api-contract';
import type { DateInterval } from '../../../utils/dates/helpers/dateIntervals';
import type { VisitsParams } from '../../types';

export type GetVisitsOptions = {
  doIntervalFallback?: boolean;
  loadPrevInterval?: boolean;
};

export type LoadVisits = {
  params: VisitsParams;
  options: GetVisitsOptions;
};

export type VisitsLoaded = {
  visits: ShlinkVisit[];
  prevVisits?: ShlinkVisit[];
  params?: VisitsParams;
};

export type VisitsLoadingInfo = {
  loading: boolean;
  cancelLoad: boolean;
  errorData: ProblemDetailsError | null;
  progress: number | null;
};

export type VisitsInfo = VisitsLoadingInfo & VisitsLoaded & {
  fallbackInterval?: DateInterval;
};

export type VisitsDeletion = {
  deleting: boolean;
  error: boolean,
  errorData?: ProblemDetailsError;
};
