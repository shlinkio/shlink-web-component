import { createSlice } from '@reduxjs/toolkit';
import { parseApiError } from '../../../../api-contract/utils';
import { createNewVisits } from '../../../reducers/visitCreation';
import type { CreateVisit, VisitsParams } from '../../../types';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from '../types';
import type { createVisitsComparisonAsyncThunk } from './createVisitsComparisonAsyncThunk';

type VisitsReducerOptions<T extends LoadVisitsForComparison> = {
  name: string;
  asyncThunk: ReturnType<typeof createVisitsComparisonAsyncThunk<T>>;
  initialState: VisitsComparisonInfo;
  filterCreatedVisitsForGroup: (
    state: { groupKey: string; params?: VisitsParams },
    createdVisits: CreateVisit[],
  ) => CreateVisit[];
};

export const createVisitsComparisonReducer = <T extends LoadVisitsForComparison>(
  { name, asyncThunk, initialState, filterCreatedVisitsForGroup }: VisitsReducerOptions<T>,
) => {
  const { pending, rejected, fulfilled, progressChanged } = asyncThunk;
  const { reducer, actions } = createSlice({
    name,
    initialState,
    reducers: {
      cancelGetVisits: () => ({ status: 'canceled' as const }),
    },
    extraReducers: (builder) => {
      builder.addCase(pending, () => ({ status: 'loading', progress: null }));
      builder.addCase(progressChanged, (state, { payload: progress }) => (
        // Update progress only if already loading
        state.status !== 'loading' ? state : { status: 'loading', progress }
      ));
      builder.addCase(rejected, (_, { error }) => ({ status: 'error', error: parseApiError(error) }));
      builder.addCase(fulfilled, (state, { payload }) => ({ ...state, ...payload, status: 'loaded' }));

      builder.addCase(createNewVisits, (state, { payload }) => {
        if (state.status !== 'loaded') {
          return state;
        }

        const { visitsGroups, params, ...rest } = state;
        const newVisitGroupsPairs = Object.keys(visitsGroups).map((groupKey) => {
          const newVisits = filterCreatedVisitsForGroup(
            { params, groupKey },
            payload.createdVisits,
          ).map(({ visit }) => visit);

          return [groupKey, [...newVisits, ...visitsGroups[groupKey]]];
        });
        const enhancedVisitsGroups = Object.fromEntries(newVisitGroupsPairs);

        return { ...rest, params, visitsGroups: enhancedVisitsGroups };
      });
    },
  });
  const { cancelGetVisits } = actions;

  return { reducer, cancelGetVisits };
};
