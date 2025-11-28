import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkDeleteVisitsResult } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../store/helpers';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisitsDeletion';

export type OrphanVisitsDeletion = VisitsDeletion<ShlinkDeleteVisitsResult>;

const initialState: OrphanVisitsDeletion = {
  status: 'idle',
};

export const deleteOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/deleteOrphanVisits`,
  (): Promise<ShlinkDeleteVisitsResult> => apiClientFactory().deleteOrphanVisits(),
);

export const orphanVisitsDeletionReducerCreator = (
  deleteOrphanVisitsThunk: ReturnType<typeof deleteOrphanVisits>,
) => createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as OrphanVisitsDeletion,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(deleteOrphanVisitsThunk.pending, () => ({ status: 'deleting' }));
    builder.addCase(deleteOrphanVisitsThunk.rejected, (_, { error }) => (
      { status: 'error', error: parseApiError(error) }
    ));
    builder.addCase(deleteOrphanVisitsThunk.fulfilled, (_, { payload }) => {
      const { deletedVisits } = payload;
      return { status: 'deleted', deletedVisits };
    });
  },
});
