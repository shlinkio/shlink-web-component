import { createAction, createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/shortUrlDeletion';

export interface ShortUrlDeletion {
  shortCode: string;
  loading: boolean;
  deleted: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
}

const initialState: ShortUrlDeletion = {
  shortCode: '',
  loading: false,
  deleted: false,
  error: false,
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
  initialState,
  reducers: {
    resetDeleteShortUrl: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      deleteShortUrlThunk.pending,
      (state) => ({ ...state, loading: true, error: false, deleted: false }),
    );
    builder.addCase(deleteShortUrlThunk.rejected, (state, { error }) => (
      { ...state, errorData: parseApiError(error), loading: false, error: true, deleted: false }
    ));
    builder.addCase(deleteShortUrlThunk.fulfilled, (state, { payload }) => (
      { ...state, shortCode: payload.shortCode, loading: false, error: false, deleted: true }
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
