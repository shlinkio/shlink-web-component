import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ProblemDetailsError, ShlinkVisit } from '../../../api-contract';

type VisitsParams = Omit<ShlinkVisitsParams, 'page' | 'itemsPerPage'>;

export type VisitsComparisonInfo = {
  visitsGroups: Record<string, ShlinkVisit[]>;
  loading: boolean;
  errorData: ProblemDetailsError | null;
  progress: number | null;
  cancelLoad: boolean;
  query?: VisitsParams;
};

export type LoadVisitsForComparison = {
  query?: VisitsParams;
};

export type VisitsForComparisonLoaded<T = {}> = T & {
  visitsGroups: Record<string, ShlinkVisit[]>;
  query?: VisitsParams;
};
