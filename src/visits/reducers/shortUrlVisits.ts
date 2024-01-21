import type { ShlinkShortUrlVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient } from '../../api-contract';
import { filterCreatedVisitsByShortUrl } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { deleteShortUrlVisits } from './shortUrlVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisits';

type WithShortCode = {
  shortCode: string;
};

export type ShortUrlVisits = VisitsInfo<ShlinkShortUrlVisitsParams> & WithShortCode;

const initialState: ShortUrlVisits = {
  visits: [],
  shortCode: '',
  loading: false,
  errorData: null,
  cancelLoad: false,
  progress: null,
};

export type LoadShortUrlVisits = LoadVisits<ShlinkShortUrlVisitsParams> & WithShortCode;

export const getShortUrlVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisits`,
  createLoaders: ({ shortCode, query = {}, doIntervalFallback = false }: LoadShortUrlVisits) => {
    const apiClient = apiClientFactory();

    // TODO
    //     console.log(loadPrevInterval);
    //  1. Extract start and end dates from query.
    //  2. Calculate the previous date range, by checking the distance from start to end, and getting an equivalent
    //     range where the new end date is the same as provided start date.
    //  3. Pass a third visitsLoader which is the same as the first, but overwriting the dates.
    //  ---
    //  Nice to have:
    //  1. There should be a helper, like `lastVisitLoaderForLoader`, which creates visitsLoader and prevVisitsLoader
    //  2. `query` is coming casted into API params, which is happening on every visits component. Ideally we should get
    //     a `VisitsParams` object instead, and call toApiParams() only once in the common helper, and additionally, it
    //     would simplify calculating prev interval from Date objects instead of strings, and reduce the
    //     Date-to-string-to-Date back and forth

    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getShortUrlVisits(
      shortCode,
      { ...query, page, itemsPerPage },
    );
    const lastVisitLoader = lastVisitLoaderForLoader(
      doIntervalFallback,
      async (params) => apiClient.getShortUrlVisits(shortCode, { ...params, domain: query.domain }),
    );

    return [visitsLoader, lastVisitLoader];
  },
  getExtraFulfilledPayload: ({ shortCode, query = {} }: LoadShortUrlVisits) => (
    { shortCode, query, domain: query.domain }
  ),
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
      if (state.shortCode === payload.shortCode && state.query?.domain === payload.domain) {
        return { ...state, visits: [] };
      }

      return state;
    });
  },
  filterCreatedVisits: ({ shortCode, query = {} }: ShortUrlVisits, createdVisits) => {
    const { domain, ...restOfQuery } = query;
    return filterCreatedVisitsByShortUrl(createdVisits, { shortCode, domain }, restOfQuery);
  },
});
