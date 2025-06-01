import { createSlice } from '@reduxjs/toolkit';
import type { ProblemDetailsError, ShlinkApiClient, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../utils/redux';
import { shortUrlMatches } from '../helpers';

const REDUCER_PREFIX = 'shlink/shortUrlsDetails';

export type ShortUrlsDetails = {
  shortUrls?: Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>;
  loading: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
};

const initialState: ShortUrlsDetails = {
  loading: false,
  error: false,
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
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getShortUrlsDetails.pending, () => ({ loading: true, error: false }));
      builder.addCase(getShortUrlsDetails.rejected, (_, { error }) => (
        { loading: false, error: true, errorData: parseApiError(error) }
      ));
      builder.addCase(getShortUrlsDetails.fulfilled, (_, { payload: shortUrls }) => ({ ...initialState, shortUrls }));
    },
  });

  return { reducer, getShortUrlsDetails };
};
