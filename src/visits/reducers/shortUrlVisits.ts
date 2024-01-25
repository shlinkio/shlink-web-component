import type { ShlinkApiClient } from '../../api-contract';
import type { ShortUrlIdentifier } from '../../short-urls/data';
import { filterCreatedVisitsByShortUrl, isStrictRangeParams, paramsForPrevDateRange, toApiParams } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { deleteShortUrlVisits } from './shortUrlVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisits';

export type ShortUrlVisits = VisitsInfo & ShortUrlIdentifier;

const initialState: ShortUrlVisits = {
  visits: [],
  shortCode: '',
  loading: false,
  errorData: null,
  cancelLoad: false,
  progress: null,
};

export type LoadShortUrlVisits = LoadVisits & ShortUrlIdentifier;

export const getShortUrlVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisits`,
  createLoaders: ({ shortCode, domain, params, options }: LoadShortUrlVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false, loadPrevInterval = false } = options;
    const query = { ...toApiParams(params), domain };
    const queryForPrevVisits = loadPrevInterval && isStrictRangeParams(params) ? {
      ...toApiParams(paramsForPrevDateRange(params)),
      domain,
    } : undefined;

    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getShortUrlVisits(
      shortCode,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(
      doIntervalFallback,
      async (q) => apiClient.getShortUrlVisits(shortCode, { ...q, domain }),
    );
    const prevVisitsLoader = queryForPrevVisits && (
      async (page: number, itemsPerPage: number) => apiClient.getShortUrlVisits(
        shortCode,
        { ...queryForPrevVisits, page, itemsPerPage },
      )
    );

    return { visitsLoader, lastVisitLoader, prevVisitsLoader };
  },
  shouldCancel: (getState) => getState().shortUrlVisits.cancelLoad,
});

export const shortUrlVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getShortUrlVisits>,
  deleteShortUrlVisitsThunk: ReturnType<typeof deleteShortUrlVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  extraReducers: (builder) => {
    builder.addCase(deleteShortUrlVisitsThunk.fulfilled, (state, { payload }) => {
      if (state.shortCode === payload.shortCode && state.domain === payload.domain) {
        return { ...state, visits: [] };
      }

      return state;
    });
  },
  filterCreatedVisits: ({ shortCode, domain, params }: ShortUrlVisits, createdVisits) => filterCreatedVisitsByShortUrl(
    createdVisits,
    { shortCode, domain },
    params?.dateRange,
  ),
});
