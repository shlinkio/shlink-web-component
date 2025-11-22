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
  saving: boolean;
  saved: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
};

const initialState: SetShortUrlRedirectRules = {
  saving: false,
  saved: false,
  error: false,
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
    initialState,
    reducers: {
      resetSetRules: () => initialState,
    },
    extraReducers: (builder) => {
      builder.addCase(setShortUrlRedirectRulesThunk.pending, () => ({ saving: true, saved: false, error: false }));
      builder.addCase(setShortUrlRedirectRulesThunk.rejected, (_, { error }) => (
        { saving: false, saved: false, error: true, errorData: parseApiError(error) }
      ));
      builder.addCase(setShortUrlRedirectRulesThunk.fulfilled, () => ({ saving: false, error: false, saved: true }));
    },
  });

  const { resetSetRules } = actions;

  return { reducer, resetSetRules };
};
