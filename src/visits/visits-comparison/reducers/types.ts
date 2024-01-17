import type { ShlinkVisit } from '../../../api-contract';
import type { VisitsLoadingInfo } from '../../reducers/types';
import type { VisitsQueryParams } from '../../types';

export type VisitsComparisonInfo = VisitsLoadingInfo & {
  visitsGroups: Record<string, ShlinkVisit[]>;
  cancelLoad: boolean;
  query?: VisitsQueryParams;
};

export type LoadVisitsForComparison = {
  query?: VisitsQueryParams;
};

export type VisitsForComparisonLoaded<T = {}> = T & {
  visitsGroups: Record<string, ShlinkVisit[]>;
  query?: VisitsQueryParams;
};
