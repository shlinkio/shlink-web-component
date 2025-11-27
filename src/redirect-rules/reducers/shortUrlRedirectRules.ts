import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkRedirectRulesList, ShlinkShortUrlIdentifier } from '../../api-contract';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/getShortUrlRedirectRules';

export type ShortUrlRedirectRules = {
  status: 'idle' | 'loading' | 'error';
} | (ShlinkRedirectRulesList & {
  status: 'loaded';
});

const initialState: ShortUrlRedirectRules = {
  status: 'idle',
};

export const getShortUrlRedirectRulesThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/getShortUrlRedirectRules`,
  (
    { apiClientFactory, ...rest }: WithApiClient<ShlinkShortUrlIdentifier>,
  ) => apiClientFactory().getShortUrlRedirectRules(rest),
);

export const { reducer: shortUrlRedirectRulesReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlRedirectRules,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getShortUrlRedirectRulesThunk.pending, () => ({ status: 'loading' }));
    builder.addCase(getShortUrlRedirectRulesThunk.rejected, () => ({ status: 'error' }));
    builder.addCase(
      getShortUrlRedirectRulesThunk.fulfilled,
      (_, { payload }) => ({ status: 'loaded', ...payload }),
    );
  },
});

export const useUrlRedirectRules = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getShortUrlRedirectRules = useCallback(
    (shortUrl: ShlinkShortUrlIdentifier) => dispatch(getShortUrlRedirectRulesThunk({ ...shortUrl, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlRedirectRules = useAppSelector((state) => state.shortUrlRedirectRules);

  return { shortUrlRedirectRules, getShortUrlRedirectRules };
};
