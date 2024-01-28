import type { ShlinkApiClient } from '../../api-contract';
import { filterCreatedVisitsByTag, isMandatoryStartDateRangeParams, paramsForPrevDateRange, toApiParams } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadVisits, VisitsInfo } from './types';

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

export type LoadTagVisits = LoadVisits & WithTag;

export const getTagVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisits`,
  createLoaders: ({ tag, params, options }: LoadTagVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false, loadPrevInterval } = options;
    const query = toApiParams(params);
    const queryForPrevVisits = loadPrevInterval && isMandatoryStartDateRangeParams(params)
      ? toApiParams(paramsForPrevDateRange(params))
      : undefined;

    const visitsLoader = (page: number, itemsPerPage: number) => apiClient.getTagVisits(
      tag,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, async (q) => apiClient.getTagVisits(tag, q));
    const prevVisitsLoader = queryForPrevVisits && (
      (page: number, itemsPerPage: number) => apiClient.getTagVisits(
        tag,
        { ...queryForPrevVisits, page, itemsPerPage },
      )
    );

    return { visitsLoader, lastVisitLoader, prevVisitsLoader };
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
