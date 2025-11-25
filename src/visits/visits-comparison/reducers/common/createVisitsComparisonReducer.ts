import { createSlice } from '@reduxjs/toolkit';
import { parseApiError } from '../../../../api-contract/utils';
import { createNewVisits } from '../../../reducers/visitCreation';
import type { CreateVisit } from '../../../types';
import type { VisitsComparisonInfo } from '../types';
import type { createVisitsComparisonAsyncThunk } from './createVisitsComparisonAsyncThunk';

type VisitsReducerOptions<AT extends ReturnType<typeof createVisitsComparisonAsyncThunk>> = {
  name: string;
  asyncThunkCreator: AT;
  initialState: VisitsComparisonInfo;
  filterCreatedVisitsForGroup: (
    state: Omit<VisitsComparisonInfo, 'visitsGroups'> & { groupKey: string },
    createdVisits: CreateVisit[],
  ) => CreateVisit[];
};

export const createVisitsComparisonReducer = <AT extends ReturnType<typeof createVisitsComparisonAsyncThunk>>(
  { name, asyncThunkCreator, initialState, filterCreatedVisitsForGroup }: VisitsReducerOptions<AT>,
) => {
  const { pending, rejected, fulfilled, progressChanged } = asyncThunkCreator;
  const { reducer, actions } = createSlice({
    name,
    initialState,
    reducers: {
      cancelGetVisits: (state) => ({ ...state, cancelLoad: true }),
    },
    extraReducers: (builder) => {
      builder.addCase(pending, () => ({ ...initialState, loading: true }));
      builder.addCase(rejected, (_, { error }) => ({ ...initialState, errorData: parseApiError(error) ?? null }));
      builder.addCase(fulfilled, (state, { payload }) => (
        { ...state, ...payload, loading: false, progress: null, errorData: null }
      ));

      builder.addCase(progressChanged, (state, { payload: progress }) => ({ ...state, progress }));

      builder.addCase(createNewVisits, (state, { payload }) => {
        const { visitsGroups, ...rest } = state;
        const newVisitGroupsPairs = Object.keys(visitsGroups).map((groupKey) => {
          const newVisits = filterCreatedVisitsForGroup(
            { ...rest, groupKey },
            payload.createdVisits,
          ).map(({ visit }) => visit);

          return [groupKey, [...newVisits, ...visitsGroups[groupKey]]];
        });
        const enhancedVisitsGroups = Object.fromEntries(newVisitGroupsPairs);

        return { ...rest, visitsGroups: enhancedVisitsGroups };
      });
    },
  });
  const { cancelGetVisits } = actions;

  return { reducer, cancelGetVisits };
};
