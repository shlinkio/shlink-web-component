import type { ShlinkApiClient, ShlinkVisitsParams } from '../../api-contract';
import { filterCreatedVisitsByShortUrl } from '../types/helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { deleteShortUrlVisits } from './shortUrlVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisits';

type WithShortCode = {
  shortCode: string;
};

export type ShortUrlVisits = VisitsInfo<ShlinkVisitsParams> & WithShortCode;

export type LoadShortUrlVisits = LoadVisits<ShlinkVisitsParams> & WithShortCode;

const initialState: ShortUrlVisits = {
  visits: [],
  shortCode: '',
  loading: false,
  errorData: null,
  cancelLoad: false,
  progress: null,
};

export const getShortUrlVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisits`,
  createLoaders: ({ shortCode, query = {}, doIntervalFallback = false }: LoadShortUrlVisits) => {
    const apiClient = apiClientFactory();
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
