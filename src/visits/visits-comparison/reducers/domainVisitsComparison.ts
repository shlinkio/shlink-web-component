import type { ShlinkApiClient } from '../../../api-contract';
import { filterCreatedVisitsByDomain, toApiParams } from '../../helpers';
import { createVisitsComparisonAsyncThunk } from './common/createVisitsComparisonAsyncThunk';
import { createVisitsComparisonReducer } from './common/createVisitsComparisonReducer';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './types';

const REDUCER_PREFIX = 'shlink/domainVisitsComparison';

export type LoadDomainVisitsForComparison = LoadVisitsForComparison & { domains: string[]; };

const initialState: VisitsComparisonInfo = {
  visitsGroups: {},
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getDomainVisitsForComparison = (apiClientFactory: () => ShlinkApiClient) =>
  createVisitsComparisonAsyncThunk({
    typePrefix: `${REDUCER_PREFIX}/getDomainVisitsForComparison`,
    createLoaders: ({ domains, params }: LoadDomainVisitsForComparison) => {
      const apiClient = apiClientFactory();
      const loaderEntries = domains.map((domain) => [
        domain,
        async (page: number, itemsPerPage: number) => apiClient.getDomainVisits(
          domain,
          { ...toApiParams(params), page, itemsPerPage },
        ),
      ]);

      return Object.fromEntries(loaderEntries);
    },
    shouldCancel: (getState) => getState().domainVisitsComparison.cancelLoad,
  });

export const domainVisitsComparisonReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getDomainVisitsForComparison>,
) => createVisitsComparisonReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisitsForGroup: ({ groupKey: domain, params }, createdVisits) => filterCreatedVisitsByDomain(
    createdVisits,
    domain,
    params?.dateRange,
  ),
});
