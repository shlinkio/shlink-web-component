import { createAction, createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/shortUrlDeletion';

export type ShortUrlDeletion = {
  status: 'idle' | 'deleting';
} | {
  status: 'deleted';
  shortCode: string;
} | {
  status: 'error';
  error?: ProblemDetailsError;
};

const initialState: ShortUrlDeletion = {
  status: 'idle',
};

export const deleteShortUrlThunk = createAsyncThunk(`${REDUCER_PREFIX}/deleteShortUrl`, async (
  { shortCode, domain, apiClientFactory }: WithApiClient<ShlinkShortUrlIdentifier>,
): Promise<ShlinkShortUrlIdentifier> => {
  await apiClientFactory().deleteShortUrl({ shortCode, domain });
  return { shortCode, domain };
});

export const shortUrlDeleted = createAction<ShlinkShortUrl>(`${REDUCER_PREFIX}/shortUrlDeleted`);

const { actions, reducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlDeletion,
  reducers: {
    resetDeleteShortUrl: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(deleteShortUrlThunk.pending, () => ({ status: 'deleting' }));
    builder.addCase(deleteShortUrlThunk.rejected, (_, { error }) => ({ status: 'error', error: parseApiError(error) }));
    builder.addCase(deleteShortUrlThunk.fulfilled, (_, { payload }) => (
      { status: 'deleted', shortCode: payload.shortCode }
    ));
  },
});

export const { resetDeleteShortUrl } = actions;

export const shortUrlDeletionReducer = reducer;

export const useUrlDeletion = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const deleteShortUrl = useCallback(
    (shortUrl: ShlinkShortUrlIdentifier) => dispatch(deleteShortUrlThunk({ ...shortUrl, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const resetDeleteShortUrl = useCallback(() => dispatch(actions.resetDeleteShortUrl()), [dispatch]);
  const dispatchShortUrlDeleted = useCallback(
    (shortUrl: ShlinkShortUrl) => dispatch(shortUrlDeleted(shortUrl)),
    [dispatch],
  );
  const shortUrlDeletion = useAppSelector((state) => state.shortUrlDeletion);

  return { shortUrlDeletion, resetDeleteShortUrl, shortUrlDeleted: dispatchShortUrlDeleted, deleteShortUrl };
};
