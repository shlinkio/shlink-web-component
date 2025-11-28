import { createSlice } from '@reduxjs/toolkit';
import type {
  ProblemDetailsError,
  ShlinkApiClient,
  ShlinkSetRedirectRulesData,
  ShlinkShortUrlIdentifier,
} from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/setShortUrlRedirectRules';

export type SetShortUrlRedirectRules = {
  status: 'idle' | 'saving' | 'saved';
} | {
  status: 'error';
  error?: ProblemDetailsError;
};

const initialState: SetShortUrlRedirectRules = {
  status: 'idle',
};

export type SetShortUrlRedirectRulesInfo = {
  shortUrl: ShlinkShortUrlIdentifier;
  data: ShlinkSetRedirectRulesData;
};

export const setShortUrlRedirectRules = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/setShortUrlRedirectRules`,
  ({ shortUrl, data }: SetShortUrlRedirectRulesInfo) => {
    const { shortCode, domain } = shortUrl;
    return apiClientFactory().setShortUrlRedirectRules({ shortCode, domain }, data);
  },
);

export const setShortUrlRedirectRulesReducerCreator = (
  setShortUrlRedirectRulesThunk: ReturnType<typeof setShortUrlRedirectRules>,
) => {
  const { reducer, actions } = createSlice({
    name: REDUCER_PREFIX,
    initialState: initialState as SetShortUrlRedirectRules,
    reducers: {
      resetSetRules: () => initialState,
    },
    extraReducers: (builder) => {
      builder.addCase(setShortUrlRedirectRulesThunk.pending, () => ({ status: 'saving' }));
      builder.addCase(setShortUrlRedirectRulesThunk.rejected, (_, { error }) => (
        { status: 'error', error: parseApiError(error) }
      ));
      builder.addCase(setShortUrlRedirectRulesThunk.fulfilled, () => ({ status: 'saved' }));
    },
  });

  const { resetSetRules } = actions;

  return { reducer, resetSetRules };
};
