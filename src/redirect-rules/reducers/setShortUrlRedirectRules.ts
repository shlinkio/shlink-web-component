import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ProblemDetailsError, ShlinkSetRedirectRulesData, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';

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

export const setShortUrlRedirectRulesThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/setShortUrlRedirectRules`,
  ({ shortUrl, data, apiClientFactory }: WithApiClient<SetShortUrlRedirectRulesInfo>) => {
    const { shortCode, domain } = shortUrl;
    return apiClientFactory().setShortUrlRedirectRules({ shortCode, domain }, data);
  },
);

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

export const { resetSetRules } = actions;

export const shortUrlRedirectRulesSavingReducer = reducer;

export const useUrlRedirectRulesSaving = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const setShortUrlRedirectRules = useCallback(
    (info: SetShortUrlRedirectRulesInfo) => dispatch(setShortUrlRedirectRulesThunk({ ...info, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const resetSetRules = useCallback(() => dispatch(actions.resetSetRules()), [dispatch]);
  const shortUrlRedirectRulesSaving = useAppSelector((state) => state.shortUrlRedirectRulesSaving);

  return { shortUrlRedirectRulesSaving, resetSetRules, setShortUrlRedirectRules };
};
