import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkShortUrlsListParams, ShlinkShortUrlsResponse } from '../../api-contract';
import { createAsyncThunk } from '../../utils/redux';
import { createNewVisits } from '../../visits/reducers/visitCreation';
import { shortUrlMatches } from '../helpers';
import type { createShortUrl } from './shortUrlCreation';
import { shortUrlDeleted } from './shortUrlDeletion';
import type { editShortUrl } from './shortUrlEdition';

const REDUCER_PREFIX = 'shlink/shortUrlsList';
export const ITEMS_IN_OVERVIEW_PAGE = 5;

export interface ShortUrlsList {
  shortUrls?: ShlinkShortUrlsResponse;
  loading: boolean;
  error: boolean;
}

const initialState: ShortUrlsList = {
  loading: true,
  error: false,
};

export const listShortUrls = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/listShortUrls`,
  (params: ShlinkShortUrlsListParams | void): Promise<ShlinkShortUrlsResponse> => apiClientFactory().listShortUrls(
    params ?? {},
  ),
);

export const shortUrlsListReducerCreator = (
  listShortUrlsThunk: ReturnType<typeof listShortUrls>,
  editShortUrlThunk: ReturnType<typeof editShortUrl>,
  createShortUrlThunk: ReturnType<typeof createShortUrl>,
) => createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listShortUrlsThunk.pending, (state) => ({ ...state, loading: true, error: false }));
    builder.addCase(listShortUrlsThunk.rejected, () => ({ loading: false, error: true }));
    builder.addCase(
      listShortUrlsThunk.fulfilled,
      (_, { payload: shortUrls }) => ({ loading: false, error: false, shortUrls }),
    );

    builder.addCase(
      createShortUrlThunk.fulfilled,
      (state, { payload }) => {
        if (!state.shortUrls) {
          return;
        }

        state.shortUrls.data = [payload, ...state.shortUrls.data.slice(0, ITEMS_IN_OVERVIEW_PAGE - 1)];
        state.shortUrls.pagination.totalItems += 1;
      },
    );

    builder.addCase(
      editShortUrlThunk.fulfilled,
      (state, { payload: editedShortUrl }) => {
        if (!state.shortUrls) {
          return;
        }

        state.shortUrls.data = state.shortUrls.data.map((shortUrl) => {
          const { shortCode, domain } = editedShortUrl;
          return shortUrlMatches(shortUrl, shortCode, domain) ? editedShortUrl : shortUrl;
        });
      },
    );

    builder.addCase(
      shortUrlDeleted,
      (state, { payload }) => {
        if (!state.shortUrls) {
          return;
        }

        state.shortUrls.data = state.shortUrls.data.filter(
          (shortUrl) => !shortUrlMatches(shortUrl, payload.shortCode, payload.domain),
        );
        state.shortUrls.pagination.totalItems -= 1;
      },
    );

    builder.addCase(
      createNewVisits,
      (state, { payload }) => {
        if (!state.shortUrls) {
          return;
        }

        state.shortUrls.data = state.shortUrls.data.map(
          (currentShortUrl) => payload.createdVisits.findLast(
            ({ shortUrl }) => shortUrl && shortUrlMatches(currentShortUrl, shortUrl.shortCode, shortUrl.domain),
          )?.shortUrl ?? currentShortUrl,
        );
      },
    );
  },
});
