import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import type { WithApiClient } from '../../../store/helpers';
import { useApiClientFactory } from '../../../store/helpers';
import { filterCreatedVisitsByDomain } from '../../helpers';
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

export const getDomainVisitsForComparisonThunk = createVisitsComparisonAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getDomainVisitsForComparison`,
  createLoaders: ({ domains, apiClientFactory }: WithApiClient<LoadDomainVisitsForComparison>) => {
    const apiClient = apiClientFactory();
    const loaderEntries = domains.map((domain) => [
      domain,
      (query: ShlinkVisitsParams) => apiClient.getDomainVisits(domain, query),
    ]);

    return Object.fromEntries(loaderEntries);
  },
  shouldCancel: (getState) => getState().domainVisitsComparison.cancelLoad,
});

export const {
  reducer: domainVisitsComparisonReducer,
  cancelGetVisits: cancelGetDomainVisitsForComparison,
} = createVisitsComparisonReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunk: getDomainVisitsForComparisonThunk,
  filterCreatedVisitsForGroup: ({ groupKey: domain, params }, createdVisits) => filterCreatedVisitsByDomain(
    createdVisits,
    domain,
    params?.dateRange,
  ),
});

export const useDomainVisitsComparison = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getDomainVisitsForComparison = useCallback(
    (data: LoadDomainVisitsForComparison) => dispatch(getDomainVisitsForComparisonThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const cancelGetVisits = useCallback(() => dispatch(cancelGetDomainVisitsForComparison()), [dispatch]);
  const domainVisitsComparison = useAppSelector((state) => state.domainVisitsComparison);

  return { domainVisitsComparison, getDomainVisitsForComparison, cancelGetDomainVisitsForComparison: cancelGetVisits };
};
