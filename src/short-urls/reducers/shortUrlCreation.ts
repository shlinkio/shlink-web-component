import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkCreateShortUrlData, ShlinkShortUrl } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/shortUrlCreation';

export type ShortUrlCreation = {
  status: 'idle' | 'saving';
} | {
  status: 'saved';
  result: ShlinkShortUrl;
} | {
  status: 'error';
  error?: ProblemDetailsError;
};

const initialState: ShortUrlCreation = {
  status: 'idle',
};

export const createShortUrlThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/createShortUrl`,
  (
    { apiClientFactory, ...data }: WithApiClient<ShlinkCreateShortUrlData>,
  ): Promise<ShlinkShortUrl> => apiClientFactory().createShortUrl(data),
);

const { reducer, actions } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlCreation, // Without this casting it infers type ShortUrlCreationWaiting
  reducers: {
    resetCreateShortUrl: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(createShortUrlThunk.pending, () => ({ status: 'saving' }));
    builder.addCase(
      createShortUrlThunk.rejected,
      (_, { error }) => ({ status: 'error', error: parseApiError(error) }),
    );
    builder.addCase(createShortUrlThunk.fulfilled, (_, { payload: result }) => ({ result, status: 'saved' }));
  },
});

export const { resetCreateShortUrl } = actions;

export const shortUrlCreationReducer = reducer;

export const useUrlCreation = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const resetCreateShortUrl = useCallback(() => dispatch(actions.resetCreateShortUrl()), [dispatch]);
  const createShortUrl = useCallback(
    (data: ShlinkCreateShortUrlData) => dispatch(createShortUrlThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlCreation = useAppSelector((state) => state.shortUrlCreation);

  return { shortUrlCreation, resetCreateShortUrl, createShortUrl };
};
