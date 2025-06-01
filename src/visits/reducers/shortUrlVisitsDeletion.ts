import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkDeleteVisitsResult, ShlinkShortUrlIdentifier } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../utils/redux';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisitsDeletion';

type DeleteVisitsResult = ShlinkDeleteVisitsResult & ShlinkShortUrlIdentifier;

export type ShortUrlVisitsDeletion = VisitsDeletion & DeleteVisitsResult;

const initialState: ShortUrlVisitsDeletion = {
  shortCode: '',
  deletedVisits: 0,
  deleting: false,
  error: false,
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
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteShortUrlVisitsThunk.pending, (state) => ({ ...state, deleting: true, error: false }));
    builder.addCase(deleteShortUrlVisitsThunk.rejected, (state, { error }) => (
      { ...state, deleting: false, error: true, errorData: parseApiError(error) }
    ));
    builder.addCase(deleteShortUrlVisitsThunk.fulfilled, (_, { payload }) => {
      const { shortCode, domain, deletedVisits } = payload;
      return { ...initialState, shortCode, domain, deletedVisits };
    });
  },
});
