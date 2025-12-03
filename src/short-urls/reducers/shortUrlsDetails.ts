import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';
import { shortUrlMatches } from '../helpers';

const REDUCER_PREFIX = 'shlink/shortUrlsDetails';

export type ShortUrlsDetails = {
  status: 'idle' | 'loading';
} | {
  status: 'error';
  error?: ProblemDetailsError;
} | {
  status: 'loaded';
  shortUrls: Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>;
};

const initialState: ShortUrlsDetails = {
  status: 'idle',
};

export const getShortUrlsDetailsThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/getShortUrlsDetails`,
  async (
    { identifiers, apiClientFactory }: WithApiClient<{ identifiers: ShlinkShortUrlIdentifier[] }>,
    { getState },
  ): Promise<Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>> => {
    const { shortUrlsList } = getState();
    const pairs = await Promise.all(identifiers.map(
      async (identifier): Promise<[ShlinkShortUrlIdentifier, ShlinkShortUrl]> => {
        const { shortCode, domain } = identifier;
        const alreadyLoaded = shortUrlsList.status === 'loaded'
          ? shortUrlsList.shortUrls.data.find((url) => shortUrlMatches(url, shortCode, domain))
          : undefined;

        return [identifier, alreadyLoaded ?? await apiClientFactory().getShortUrl({ shortCode, domain })];
      },
    ));

    return new Map(pairs);
  },
);

export const { reducer: shortUrlsDetailsReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlsDetails,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getShortUrlsDetailsThunk.pending, () => ({ status: 'loading' }));
    builder.addCase(getShortUrlsDetailsThunk.rejected, (_, { error }) => (
      { status: 'error', error: parseApiError(error) }
    ));
    builder.addCase(getShortUrlsDetailsThunk.fulfilled, (_, { payload: shortUrls }) => (
      { status: 'loaded', shortUrls }
    ));
  },
});

export const useUrlsDetails = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getShortUrlsDetails = useCallback(
    (identifiers: ShlinkShortUrlIdentifier[]) => dispatch(getShortUrlsDetailsThunk({ identifiers, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlsDetails = useAppSelector((state) => state.shortUrlsDetails);

  return { shortUrlsDetails, getShortUrlsDetails };
};
