import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type {
  ProblemDetailsError,
  ShlinkEditShortUrlData,
  ShlinkShortUrl,
  ShlinkShortUrlIdentifier,
} from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';

const REDUCER_PREFIX = 'shlink/shortUrlEdition';

export type ShortUrlEdition = {
  shortUrl?: ShlinkShortUrl;
  saving: boolean;
  saved: boolean;
  error: boolean;
  errorData?: ProblemDetailsError;
};

export type EditShortUrl = ShlinkShortUrlIdentifier & {
  data: ShlinkEditShortUrlData;
};

const initialState: ShortUrlEdition = {
  saving: false,
  saved: false,
  error: false,
};

export const editShortUrlThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/editShortUrl`,
  ({ shortCode, domain, data, apiClientFactory }: WithApiClient<EditShortUrl>): Promise<ShlinkShortUrl> =>
    apiClientFactory().updateShortUrl({ shortCode, domain }, data as any) // TODO parse dates
  ,
);

export const { reducer: shortUrlEditionReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(editShortUrlThunk.pending, (state) => ({ ...state, saving: true, error: false, saved: false }));
    builder.addCase(
      editShortUrlThunk.rejected,
      (state, { error }) => ({ ...state, saving: false, error: true, saved: false, errorData: parseApiError(error) }),
    );
    builder.addCase(
      editShortUrlThunk.fulfilled,
      (_, { payload: shortUrl }) => ({ shortUrl, saving: false, error: false, saved: true }),
    );
  },
});

export const useUrlEdition = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const editShortUrl = useCallback(
    (edit: EditShortUrl) => dispatch(editShortUrlThunk({ ...edit, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlEdition = useAppSelector((state) => state.shortUrlEdition);

  return { shortUrlEdition, editShortUrl };
};
