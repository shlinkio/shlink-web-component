import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkRedirectRuleData } from '../../api-contract';
import type { ShortUrlIdentifier } from '../../short-urls/data';
import { createAsyncThunk } from '../../utils/redux';

const REDUCER_PREFIX = 'shlink/getShortUrlRedirectRules';

export type ShortUrlRedirectRules = {
  redirectRules?: ShlinkRedirectRuleData[];
  defaultLongUrl?: string;
  loading: boolean;
  error: boolean;
};

const initialState: ShortUrlRedirectRules = {
  loading: true,
  error: false,
};

export const getShortUrlRedirectRules = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/getShortUrlRedirectRules`,
  ({ shortCode, domain }: ShortUrlIdentifier) => apiClientFactory().getShortUrlRedirectRules({ shortCode, domain }),
);

export const shortUrlRedirectRulesReducerCreator = (
  getShortUrlRedirectRulesThunk: ReturnType<typeof getShortUrlRedirectRules>,
) => createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getShortUrlRedirectRulesThunk.pending, () => ({ loading: true, error: false }));
    builder.addCase(getShortUrlRedirectRulesThunk.rejected, () => ({ loading: false, error: true }));
    builder.addCase(
      getShortUrlRedirectRulesThunk.fulfilled,
      (_, { payload }) => ({ loading: false, error: false, ...payload }),
    );
  },
});
