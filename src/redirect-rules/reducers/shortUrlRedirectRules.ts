import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkRedirectRulesList, ShlinkShortUrlIdentifier } from '../../api-contract';
import { createAsyncThunk } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/getShortUrlRedirectRules';

export type ShortUrlRedirectRules = {
  status: 'idle' | 'loading' | 'error';
} | (ShlinkRedirectRulesList & {
  status: 'loaded';
});

const initialState: ShortUrlRedirectRules = {
  status: 'idle',
};

export const getShortUrlRedirectRules = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/getShortUrlRedirectRules`,
  ({ shortCode, domain }: ShlinkShortUrlIdentifier) => apiClientFactory().getShortUrlRedirectRules(
    { shortCode, domain },
  ),
);

export const shortUrlRedirectRulesReducerCreator = (
  getShortUrlRedirectRulesThunk: ReturnType<typeof getShortUrlRedirectRules>,
) => createSlice({
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
