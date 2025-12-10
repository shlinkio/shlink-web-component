import { useCallback } from 'react';
import type { ShlinkShortUrlIdentifier, ShlinkVisitsParams } from '../../api-contract';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { useApiClientFactory } from '../../store/helpers';
import { filterCreatedVisitsByShortUrl } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import { deleteShortUrlVisitsThunk } from './shortUrlVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisits';

export type ShortUrlVisits = VisitsInfo<ShlinkShortUrlIdentifier>;

const initialState: ShortUrlVisits = {
  status: 'idle',
};

export type LoadShortUrlVisits = LoadVisits & ShlinkShortUrlIdentifier;

export const getShortUrlVisitsThunk = createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisits`,
  createLoaders: ({ shortCode, domain, options, apiClientFactory }: WithApiClient<LoadShortUrlVisits>) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = (query: ShlinkVisitsParams) => apiClient.getShortUrlVisits({ shortCode, domain }, query);
    const lastVisitLoader = lastVisitLoaderForLoader(
      doIntervalFallback,
      (q) => apiClient.getShortUrlVisits({ shortCode, domain }, q),
    );

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().shortUrlVisits.status === 'canceled',
});

export const { reducer: shortUrlVisitsReducer, cancelGetVisits } = createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlVisits,
  asyncThunk: getShortUrlVisitsThunk,
  extraReducers: (builder) => {
    builder.addCase(deleteShortUrlVisitsThunk.fulfilled, (state, { payload }) => {
      if (state.status === 'loaded' && state.shortCode === payload.shortCode && state.domain === payload.domain) {
        return { ...state, visits: [] };
      }

      return state;
    });
  },
  filterCreatedVisits: (state, createdVisits) => state.status !== 'loaded'
    ? createdVisits
    : filterCreatedVisitsByShortUrl(
      createdVisits,
      { shortCode: state.shortCode, domain: state.domain },
      state.params?.dateRange,
    ),
});

export const useUrlVisits = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getShortUrlVisits = useCallback(
    (data: LoadShortUrlVisits) => dispatch(getShortUrlVisitsThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchCancelGetVisits = useCallback(() => dispatch(cancelGetVisits()), [dispatch]);
  const shortUrlVisits = useAppSelector((state) => state.shortUrlVisits);

  return { shortUrlVisits, getShortUrlVisits, cancelGetShortUrlVisits: dispatchCancelGetVisits };
};
