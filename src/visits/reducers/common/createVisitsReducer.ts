import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { parseApiError } from '../../../api-contract/utils';
import type { CreateVisit } from '../../types';
import type { LoadVisits, VisitsInfo } from '../types';
import { createNewVisits } from '../visitCreation';
import type { createVisitsAsyncThunk } from './createVisitsAsyncThunk';

interface VisitsReducerOptions<State, T extends LoadVisits> {
  name: string;
  asyncThunk: ReturnType<typeof createVisitsAsyncThunk<T>>;
  initialState: VisitsInfo<State>;
  filterCreatedVisits: (state: VisitsInfo<State>, createdVisits: CreateVisit[]) => CreateVisit[];
  extraReducers?: (builder: ActionReducerMapBuilder<VisitsInfo<State>>) => void;
}

export const createVisitsReducer = <State, T extends LoadVisits>(
  { name, asyncThunk, initialState, filterCreatedVisits, extraReducers }: VisitsReducerOptions<State, T>,
) => {
  const { pending, rejected, fulfilled, progressChanged, fallbackToInterval } = asyncThunk;
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

      // Unpack the whole payload, as it could have different props depending on the concrete reducer
      builder.addCase(fulfilled, (state, { payload }) => ({ ...state, ...payload, status: 'loaded' }));

      builder.addCase(fallbackToInterval, (_, { payload: fallbackInterval }) => (
        { status: 'fallback', fallbackInterval }
      ));

      builder.addCase(createNewVisits, (state, { payload }) => {
        if (state.status !== 'loaded') {
          return state;
        }

        const { visits } = state;
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
