import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient } from '../../api-contract';
import { filterCreatedVisitsByTag } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadWithDomainVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/tagVisits';

type WithTag = {
  tag: string;
};

export type TagVisits = VisitsInfo & WithTag;

const initialState: TagVisits = {
  visits: [],
  tag: '',
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export type LoadTagVisits = LoadWithDomainVisits & WithTag;

export const getTagVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisits`,
  createLoaders: ({ tag, options, domain }: LoadTagVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = (query: ShlinkVisitsParams) => apiClient.getTagVisits(tag, { ...query, domain });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, async (q) => apiClient.getTagVisits(tag, q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().tagVisits.cancelLoad,
});

export const tagVisitsReducerCreator = (asyncThunkCreator: ReturnType<typeof getTagVisits>) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisits: ({ tag, params }: TagVisits, createdVisits) => filterCreatedVisitsByTag(
    createdVisits,
    tag,
    params?.dateRange,
  ),
});
