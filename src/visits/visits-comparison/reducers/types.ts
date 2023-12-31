import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ProblemDetailsError, ShlinkVisit } from '../../../api-contract';

export type VisitsComparisonInfo = {
  visitsGroups: Record<string, ShlinkVisit[]>;
  loading: boolean;
  errorData: ProblemDetailsError | null;
  progress: number | null;
  cancelLoad: boolean;
  query?: ShlinkVisitsParams;
};

export type LoadVisitsForComparison = {
  query?: ShlinkVisitsParams;
};

export type VisitsForComparisonLoaded<T = {}> = T & {
  visitsGroups: Record<string, ShlinkVisit[]>;
  query?: ShlinkVisitsParams;
};
