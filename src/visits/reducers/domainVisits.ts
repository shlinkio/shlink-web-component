import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { useApiClientFactory } from '../../store/helpers';
import { filterCreatedVisitsByDomain } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/domainVisits';

interface WithDomain {
  domain: string;
}

export interface DomainVisits extends VisitsInfo, WithDomain {}

export interface LoadDomainVisits extends LoadVisits, WithDomain {}

const initialState: DomainVisits = {
  visits: [],
  domain: '',
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getDomainVisitsThunk = createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getDomainVisits`,
  createLoaders: ({ domain, options, apiClientFactory }: WithApiClient<LoadDomainVisits>) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = (query: ShlinkVisitsParams) => apiClient.getDomainVisits(domain, query);
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getDomainVisits(domain, q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().domainVisits.cancelLoad,
});

export const { reducer: domainVisitsReducer, cancelGetVisits: cancelGetDomainVisits } = createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunk: getDomainVisitsThunk,
  filterCreatedVisits: ({ domain, params }, createdVisits) => filterCreatedVisitsByDomain(
    createdVisits,
    domain,
    params?.dateRange,
  ),
});

export const useDomainVisits = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getDomainVisits = useCallback(
    (params: LoadDomainVisits) => dispatch(getDomainVisitsThunk({ ...params, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchCancelGetDomainVisits = useCallback(() => dispatch(cancelGetDomainVisits()), [dispatch]);
  const domainVisits = useAppSelector((state) => state.domainVisits);

  return { domainVisits, getDomainVisits, cancelGetDomainVisits: dispatchCancelGetDomainVisits };
};
