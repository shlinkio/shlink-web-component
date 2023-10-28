import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkDeleteVisitsResponse } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../utils/redux';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisitsDeletion';

export type OrphanVisitsDeletion = VisitsDeletion & ShlinkDeleteVisitsResponse;

const initialState: OrphanVisitsDeletion = {
  deletedVisits: 0,
  deleting: false,
  error: false,
};

export const deleteOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/deleteOrphanVisits`,
  (): Promise<ShlinkDeleteVisitsResponse> => apiClientFactory().deleteOrphanVisits(),
);

export const orphanVisitsDeletionReducerCreator = (
  deleteOrphanVisitsThunk: ReturnType<typeof deleteOrphanVisits>,
) => createSlice({
  name: REDUCER_PREFIX,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteOrphanVisitsThunk.pending, (state) => ({ ...state, deleting: true, error: false }));
    builder.addCase(deleteOrphanVisitsThunk.rejected, (state, { error }) => (
      { ...state, deleting: false, error: true, errorData: parseApiError(error) }
    ));
    builder.addCase(deleteOrphanVisitsThunk.fulfilled, (_, { payload }) => {
      const { deletedVisits } = payload;
      return { ...initialState, deletedVisits };
    });
  },
});
