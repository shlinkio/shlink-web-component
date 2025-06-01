import type { ShlinkApiClient, ShlinkShortUrlIdentifier, ShlinkVisitsParams } from '../../api-contract';
import { filterCreatedVisitsByShortUrl } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { deleteShortUrlVisits } from './shortUrlVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisits';

export type ShortUrlVisits = VisitsInfo & ShlinkShortUrlIdentifier;

const initialState: ShortUrlVisits = {
  visits: [],
  shortCode: '',
  loading: false,
  errorData: null,
  cancelLoad: false,
  progress: null,
};

export type LoadShortUrlVisits = LoadVisits & ShlinkShortUrlIdentifier;

export const getShortUrlVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisits`,
  createLoaders: ({ shortCode, domain, options }: LoadShortUrlVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = (query: ShlinkVisitsParams) => apiClient.getShortUrlVisits({ shortCode, domain }, query);
    const lastVisitLoader = lastVisitLoaderForLoader(
      doIntervalFallback,
      (q) => apiClient.getShortUrlVisits({ shortCode, domain }, q),
    );

    return { visitsLoader, lastVisitLoader };
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
