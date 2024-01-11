import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkVisit } from '../../../api-contract';
import type { VisitsLoadingInfo } from '../../reducers/types';

type VisitsParams = Omit<ShlinkVisitsParams, 'page' | 'itemsPerPage' | 'domain'>;

export type VisitsComparisonInfo = VisitsLoadingInfo & {
  visitsGroups: Record<string, ShlinkVisit[]>;
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
