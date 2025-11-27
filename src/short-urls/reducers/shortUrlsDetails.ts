import { createSlice } from '@reduxjs/toolkit';
import type { ProblemDetailsError, ShlinkApiClient, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../store/helpers';
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

export const shortUrlsDetailsReducerCreator = (apiClientFactory: () => ShlinkApiClient) => {
  const getShortUrlsDetails = createAsyncThunk(
    `${REDUCER_PREFIX}/getShortUrlsDetails`,
    async (
      identifiers: ShlinkShortUrlIdentifier[],
      { getState },
    ): Promise<Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>> => {
      const { shortUrlsList } = getState();
      const pairs = await Promise.all(identifiers.map(
        async (identifier): Promise<[ShlinkShortUrlIdentifier, ShlinkShortUrl]> => {
          const { shortCode, domain } = identifier;
          const alreadyLoaded = shortUrlsList?.shortUrls?.data.find((url) => shortUrlMatches(url, shortCode, domain));

          return [identifier, alreadyLoaded ?? await apiClientFactory().getShortUrl({ shortCode, domain })];
        },
      ));

      return new Map(pairs);
    },
  );

  const { reducer } = createSlice({
    name: REDUCER_PREFIX,
    initialState: initialState as ShortUrlsDetails,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getShortUrlsDetails.pending, () => ({ status: 'loading' }));
      builder.addCase(getShortUrlsDetails.rejected, (_, { error }) => (
        { status: 'error', error: parseApiError(error) }
      ));
      builder.addCase(getShortUrlsDetails.fulfilled, (_, { payload: shortUrls }) => ({ status: 'loaded', shortUrls }));
    },
  });

  return { reducer, getShortUrlsDetails };
};
