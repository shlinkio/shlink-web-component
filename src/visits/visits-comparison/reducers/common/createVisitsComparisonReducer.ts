import { createSlice } from '@reduxjs/toolkit';
import { parseApiError } from '../../../../api-contract/utils';
// import { createNewVisits } from '../../../reducers/visitCreation';
import type { VisitsComparisonInfo } from '../types';
import type { createVisitsComparisonAsyncThunk } from './createVisitsComparisonAsyncThunk';

type VisitsReducerOptions<
  State extends VisitsComparisonInfo,
  AT extends ReturnType<typeof createVisitsComparisonAsyncThunk>,
> = {
  name: string;
  asyncThunkCreator: AT;
  initialState: State;
  // filterCreatedVisits: (state: State, createdVisits: CreateVisit[]) => CreateVisit[];
};

export const createVisitsComparisonReducer = <
  State extends VisitsComparisonInfo,
  AT extends ReturnType<typeof createVisitsComparisonAsyncThunk>,
>(
    { name, asyncThunkCreator, initialState /* filterCreatedVisits, */ }: VisitsReducerOptions<State, AT>,
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
      builder.addCase(rejected, (_, { error }) => (
        { ...initialState, errorData: parseApiError(error) ?? null }
      ));
      builder.addCase(fulfilled, (state, { payload }) => (
        { ...state, ...payload, loading: false, progress: null, errorData: null }
      ));

      builder.addCase(progressChanged, (state, { payload: progress }) => ({ ...state, progress }));

      // TODO Handle visits creation
      // builder.addCase(createNewVisits, (state, { payload }) => {
      //   const { visits } = state;
      //   // @ts-expect-error TODO Fix type inference
      //   const newVisits = filterCreatedVisits(state, payload.createdVisits).map(({ visit }) => visit);
      //
      //   return !newVisits.length ? state : { ...state, visits: [...newVisits, ...visits] };
      // });
    },
  });
  const { cancelGetVisits } = actions;

  return { reducer, cancelGetVisits };
};
