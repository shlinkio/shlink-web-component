import { createSlice } from '@reduxjs/toolkit';
import { useCallback } from 'react';
import type { ShlinkDeleteVisitsResult } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { createAsyncThunk,useApiClientFactory  } from '../../store/helpers';
import type { VisitsDeletion } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisitsDeletion';

export type OrphanVisitsDeletion = VisitsDeletion<ShlinkDeleteVisitsResult>;

const initialState: OrphanVisitsDeletion = {
  status: 'idle',
};

export const deleteOrphanVisitsThunk = createAsyncThunk(
  `${REDUCER_PREFIX}/deleteOrphanVisits`,
  ({ apiClientFactory }: WithApiClient): Promise<ShlinkDeleteVisitsResult> => apiClientFactory().deleteOrphanVisits(),
);

export const { reducer: orphanVisitsDeletionReducer } = createSlice({
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

export const useOrphanVisitsDeletion = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const deleteOrphanVisits = useCallback(
    () => dispatch(deleteOrphanVisitsThunk({ apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const orphanVisitsDeletion = useAppSelector((state) => state.orphanVisitsDeletion);

  return { orphanVisitsDeletion, deleteOrphanVisits };
};
