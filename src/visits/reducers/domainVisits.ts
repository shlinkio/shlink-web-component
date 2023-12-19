import type { ShlinkApiClient } from '../../api-contract';
import { domainMatches } from '../../short-urls/helpers';
import { isBetween } from '../../utils/dates/helpers/date';
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
  createLoaders: ({ domain, query = {}, doIntervalFallback = false }: LoadDomainVisits) => {
    const apiClient = apiClientFactory();
    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getDomainVisits(
      domain,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, async (params) => apiClient.getDomainVisits(
      domain,
      params,
    ));

    return [visitsLoader, lastVisitLoader];
  },
  getExtraFulfilledPayload: ({ domain, query = {} }: LoadDomainVisits) => ({ domain, query }),
  shouldCancel: (getState) => getState().domainVisits.cancelLoad,
});

export const domainVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getDomainVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisits: ({ domain, query = {} }, createdVisits) => {
    const { startDate, endDate } = query;
    return createdVisits.filter(
      ({ shortUrl, visit }) =>
        shortUrl && domainMatches(shortUrl, domain) && isBetween(visit.date, startDate, endDate),
    );
  },
});
