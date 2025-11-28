import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkDeleteVisitsResult, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../store/helpers';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisitsDeletion';

type DeleteVisitsResult = ShlinkDeleteVisitsResult & ShlinkShortUrlIdentifier;

export type ShortUrlVisitsDeletion = VisitsDeletion<DeleteVisitsResult>;

const initialState: ShortUrlVisitsDeletion = {
  status: 'idle',
};

export const deleteShortUrlVisits = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/deleteShortUrlVisits`,
  async ({ shortCode, domain }: ShlinkShortUrlIdentifier): Promise<DeleteVisitsResult> => {
    const result = await apiClientFactory().deleteShortUrlVisits({ shortCode, domain });
    return { ...result, shortCode, domain };
  },
);

export const shortUrlVisitsDeletionReducerCreator = (
  deleteShortUrlVisitsThunk: ReturnType<typeof deleteShortUrlVisits>,
) => createSlice({
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
