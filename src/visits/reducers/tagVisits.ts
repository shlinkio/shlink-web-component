import type { ShlinkApiClient } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/tagVisits';

interface WithTag {
  tag: string;
}

export interface TagVisits extends VisitsInfo, WithTag {}

export interface LoadTagVisits extends LoadVisits, WithTag {}

const initialState: TagVisits = {
  visits: [],
  tag: '',
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getTagVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisits`,
  createLoaders: ({ tag, query = {}, doIntervalFallback = false }: LoadTagVisits) => {
    const apiClient = apiClientFactory();
    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getTagVisits(
      tag,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, async (params) => apiClient.getTagVisits(
      tag,
      params,
    ));

    return [visitsLoader, lastVisitLoader];
  },
  getExtraFulfilledPayload: ({ tag, query = {} }: LoadTagVisits) => ({ tag, query }),
  shouldCancel: (getState) => getState().tagVisits.cancelLoad,
});

export const tagVisitsReducerCreator = (asyncThunkCreator: ReturnType<typeof getTagVisits>) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisits: ({ tag, query = {} }: TagVisits, createdVisits) => {
    const { startDate, endDate } = query;
    return createdVisits.filter(
      ({ shortUrl, visit }) => shortUrl?.tags.includes(tag) && isBetween(visit.date, startDate, endDate),
    );
  },
});
