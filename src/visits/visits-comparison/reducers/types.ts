import type { ShlinkVisit } from '../../../api-contract';
import type { VisitsLoadingInfo } from '../../reducers/types';
import type { VisitsParams } from '../../types';

export type LoadVisitsForComparison = {
  params: VisitsParams;
};

export type VisitsForComparisonLoaded = {
  visitsGroups: Record<string, ShlinkVisit[]>;
  params?: VisitsParams;
};

export type VisitsComparisonInfo = VisitsLoadingInfo | (VisitsForComparisonLoaded & {
  status: 'loaded';
});
