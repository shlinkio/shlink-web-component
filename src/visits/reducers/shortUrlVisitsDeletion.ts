import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkDeleteVisitsResult, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk, useApiClientFactory } from '../../store/helpers';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisitsDeletion';

type DeleteVisitsResult = ShlinkDeleteVisitsResult & ShlinkShortUrlIdentifier;

export type ShortUrlVisitsDeletion = VisitsDeletion<DeleteVisitsResult>;

const initialState: ShortUrlVisitsDeletion = {
  status: 'idle',
};

export const deleteShortUrlVisitsThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/deleteShortUrlVisits`,
  async (
    { shortCode, domain, apiClientFactory }: WithApiClient<ShlinkShortUrlIdentifier>,
  ): Promise<DeleteVisitsResult> => {
    const result = await apiClientFactory().deleteShortUrlVisits({ shortCode, domain });
    return { ...result, shortCode, domain };
  },
);

export const { reducer: shortUrlVisitsDeletionReducer } = createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as ShortUrlVisitsDeletion,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteShortUrlVisitsThunk.pending, () => ({ status: 'deleting' }));
    builder.addCase(deleteShortUrlVisitsThunk.rejected, (_, { error }) => (
      { status: 'error', error: parseApiError(error) }
    ));
    builder.addCase(deleteShortUrlVisitsThunk.fulfilled, (_, { payload }) => {
      const { shortCode, domain, deletedVisits } = payload;
      return { status: 'deleted', shortCode, domain, deletedVisits };
    });
  },
});

export const useUrlVisitsDeletion = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const deleteShortUrlVisits = useCallback(
    (shortUrl: ShlinkShortUrlIdentifier) => dispatch(deleteShortUrlVisitsThunk({ ...shortUrl, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const shortUrlVisitsDeletion = useAppSelector((state) => state.shortUrlVisitsDeletion);

  return { shortUrlVisitsDeletion, deleteShortUrlVisits };
};
