import type { ShlinkApiClient } from '../../api-contract';
import { filterCreatedVisitsByDomain, isMandatoryStartDateRangeParams, paramsForPrevDateRange, toApiParams } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/domainVisits';

export const DEFAULT_DOMAIN = 'DEFAULT';

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

export const getDomainVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getDomainVisits`,
  createLoaders: ({ domain, params, options }: LoadDomainVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false, loadPrevInterval } = options;
    const query = toApiParams(params);
    const queryForPrevVisits = loadPrevInterval && isMandatoryStartDateRangeParams(params)
      ? toApiParams(paramsForPrevDateRange(params))
      : undefined;

    const visitsLoader = (page: number, itemsPerPage: number) => apiClient.getDomainVisits(
      domain,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getDomainVisits(domain, q));
    const prevVisitsLoader = queryForPrevVisits && (
      (page: number, itemsPerPage: number) => apiClient.getDomainVisits(
        domain,
        { ...queryForPrevVisits, page, itemsPerPage },
      )
    );

    return { visitsLoader, lastVisitLoader, prevVisitsLoader };
  },
  shouldCancel: (getState) => getState().domainVisits.cancelLoad,
});

export const domainVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getDomainVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisits: ({ domain, params }, createdVisits) => filterCreatedVisitsByDomain(
    createdVisits,
    domain,
    params?.dateRange,
  ),
});
