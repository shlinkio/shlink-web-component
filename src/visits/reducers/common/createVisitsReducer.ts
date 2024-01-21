import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { parseApiError } from '../../../api-contract/utils';
import type { CreateVisit } from '../../types';
import type { VisitsInfo } from '../types';
import { createNewVisits } from '../visitCreation';
import type { createVisitsAsyncThunk } from './createVisitsAsyncThunk';

interface VisitsReducerOptions<State extends VisitsInfo, AT extends ReturnType<typeof createVisitsAsyncThunk>> {
  name: string;
  asyncThunkCreator: AT;
  initialState: State;
  filterCreatedVisits: (state: State, createdVisits: CreateVisit[]) => CreateVisit[];
  extraReducers?: (builder: ActionReducerMapBuilder<State>) => void;
}

export const createVisitsReducer = <State extends VisitsInfo, AT extends ReturnType<typeof createVisitsAsyncThunk>>(
  { name, asyncThunkCreator, initialState, filterCreatedVisits, extraReducers }: VisitsReducerOptions<State, AT>,
) => {
  const { pending, rejected, fulfilled, progressChanged, fallbackToInterval } = asyncThunkCreator;
  const { reducer, actions } = createSlice({
    name,
    initialState,
    reducers: {
      cancelGetVisits: (state) => ({ ...state, cancelLoad: true }),
    },
    extraReducers: (builder) => {
      builder.addCase(pending, () => ({ ...initialState, loading: true }));
      builder.addCase(rejected, (_, { error }) => (
        { ...initialState, errorData: parseApiError(error) ?? null }
      ));
      builder.addCase(fulfilled, (state, { payload }) => (
        // Unpack the whole payload, as it could have different props depending on the concrete reducer
        { ...state, ...payload, loading: false, progress: null, errorData: null }
      ));

      builder.addCase(progressChanged, (state, { payload: progress }) => ({ ...state, progress }));
      builder.addCase(fallbackToInterval, (state, { payload: fallbackInterval }) => (
        { ...state, fallbackInterval }
      ));

      builder.addCase(createNewVisits, (state, { payload }) => {
        const { visits } = state;
        // @ts-expect-error TODO Fix type inference
        const newVisits = filterCreatedVisits(state, payload.createdVisits).map(({ visit }) => visit);

        return !newVisits.length ? state : { ...state, visits: [...newVisits, ...visits] };
      });

      // Add any other extra reducer if provided
      extraReducers?.(builder);
    },
  });
  const { cancelGetVisits } = actions;

  return { reducer, cancelGetVisits };
};
