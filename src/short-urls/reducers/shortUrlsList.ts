import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkShortUrlsList, ShlinkShortUrlsListParams } from '../../api-contract';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';
import { createNewVisits } from '../../visits/reducers/visitCreation';
import { shortUrlMatches } from '../helpers';
import { createShortUrlThunk } from './shortUrlCreation';
import { shortUrlDeleted } from './shortUrlDeletion';
import { editShortUrlThunk } from './shortUrlEdition';

const REDUCER_PREFIX = 'shlink/shortUrlsList';
export const ITEMS_IN_OVERVIEW_PAGE = 5;

export type ShortUrlsList = {
  status: 'idle' | 'loading' | 'error';
} | {
  status: 'loaded';
  shortUrls: ShlinkShortUrlsList;
};

const initialState: ShortUrlsList = {
  status: 'idle',
};

export const listShortUrlsThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/listShortUrls`,
  (
    { apiClientFactory, ...params }: WithApiClient<ShlinkShortUrlsListParams>,
  ): Promise<ShlinkShortUrlsList> => apiClientFactory().listShortUrls(params ?? {}),
);

export const { reducer: shortUrlsListReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlsList,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listShortUrlsThunk.pending, () => ({ status: 'loading' }));
    builder.addCase(listShortUrlsThunk.rejected, () => ({ status: 'error' }));
    builder.addCase(
      listShortUrlsThunk.fulfilled,
      (_, { payload: shortUrls }) => ({ status: 'loaded', shortUrls }),
    );

    builder.addCase(
      createShortUrlThunk.fulfilled,
      (state, { payload }) => {
        if (state.status !== 'loaded') {
          return;
        }

        // The only place where the list and the creation form coexist is the overview page.
        // There we can assume we are displaying page 1, and therefore, we can safely prepend the new short URL.
        // We can also remove the items above the amount that is displayed there.
        state.shortUrls.data = [payload, ...state.shortUrls.data.slice(0, ITEMS_IN_OVERVIEW_PAGE - 1)];
        state.shortUrls.pagination.totalItems += 1;
      },
    );

    builder.addCase(
      editShortUrlThunk.fulfilled,
      (state, { payload: editedShortUrl }) => {
        if (state.status !== 'loaded') {
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
        if (state.status !== 'loaded') {
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
        if (state.status !== 'loaded') {
          return;
        }

        state.shortUrls.data = state.shortUrls.data.map(
          // Find the last of the new visit for this ShortUrl, and pick its short URL. It will have an up-to-date
          // amount of visits.
          (currentShortUrl) => payload.createdVisits.findLast(
            ({ shortUrl }) => shortUrl && shortUrlMatches(currentShortUrl, shortUrl.shortCode, shortUrl.domain),
          )?.shortUrl ?? currentShortUrl,
        );
      },
    );
  },
});

export const useUrlsList = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const listShortUrls = useCallback(
    (params?: ShlinkShortUrlsListParams) => dispatch(listShortUrlsThunk({ ...params, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlsList = useAppSelector((state) => state.shortUrlsList);

  return { shortUrlsList, listShortUrls };
};
