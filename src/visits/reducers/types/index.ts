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

export type LoadWithDomainVisits = LoadVisits & {
  domain?: string;
};

export type VisitsLoaded = {
  visits: ShlinkVisit[];
  prevVisits?: ShlinkVisit[];
  params?: VisitsParams;
};

export type VisitsLoadingInfo = {
  status: 'idle' | 'canceled';
} | {
  status: 'loading';
  progress: number | null;
} | {
  status: 'error';
  error?: ProblemDetailsError;
};

export type VisitsInfo<T = unknown> = VisitsLoadingInfo | {
  // When trying to load visits on default interval results in 0 visits, but more visits exist if going back in time
  status: 'fallback';
  fallbackInterval: DateInterval;
} | (T & VisitsLoaded & {
  // When visits have been loaded, either in the first try, or after falling back to a wider interval
  status: 'loaded';
});

export type VisitsDeletion<Result = unknown> = {
  status: 'idle' | 'deleting';
} | {
  status: 'error';
  error?: ProblemDetailsError;
} | (Result & {
  status: 'deleted';
});
