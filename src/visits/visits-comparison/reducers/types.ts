import type { ShlinkVisit } from '../../../api-contract';
import type { VisitsParams } from '../../types';

export interface LoadVisitsForComparison {
  query?: VisitsParams;
}

export type VisitsForComparisonLoaded<T = {}> = T & {
  visitsGroups: Record<string, ShlinkVisit[]>;
  query?: VisitsParams;
};
