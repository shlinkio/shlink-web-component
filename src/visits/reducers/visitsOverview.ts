import { createSlice } from '@reduxjs/toolkit';
import type { ShlinkApiClient, ShlinkVisitsSummary } from '../../api-contract';
import { createAsyncThunk } from '../../store/helpers';
import { groupNewVisitsByType } from '../helpers';
import type { CreateVisit } from '../types';
import { createNewVisits } from './visitCreation';

const REDUCER_PREFIX = 'shlink/visitsOverview';

export type ParsedVisitsOverview = {
  nonOrphanVisits: ShlinkVisitsSummary;
  orphanVisits: ShlinkVisitsSummary;
};

export type VisitsOverview = {
  status: 'idle' | 'loading' | 'error';
} | (ParsedVisitsOverview & {
  status: 'loaded';
});

const initialState: VisitsOverview = {
  status: 'idle',
};

const countBots = (visits: CreateVisit[]) => visits.filter(({ visit }) => visit.potentialBot).length;

export const loadVisitsOverview = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/loadVisitsOverview`,
  (): Promise<ParsedVisitsOverview> => apiClientFactory().getVisitsOverview(),
);

export const visitsOverviewReducerCreator = (
  loadVisitsOverviewThunk: ReturnType<typeof loadVisitsOverview>,
) => createSlice({
  name: REDUCER_PREFIX,
  initialState: initialState as VisitsOverview,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadVisitsOverviewThunk.pending, () => ({ status: 'loading' }));
    builder.addCase(loadVisitsOverviewThunk.rejected, () => ({ status: 'error' }));
    builder.addCase(loadVisitsOverviewThunk.fulfilled, (_, { payload }) => ({ ...payload, status: 'loaded' }));

    builder.addCase(createNewVisits, (state, { payload }) => {
      if (state.status !== 'loaded') {
        return state;
      }

      const { nonOrphanVisits, orphanVisits, ...rest } = state;
      const { nonOrphanVisits: newNonOrphanVisits, orphanVisits: newOrphanVisits } = groupNewVisitsByType(
        payload.createdVisits,
      );

      const newNonOrphanTotalVisits = newNonOrphanVisits.length;
      const newNonOrphanBotVisits = countBots(newNonOrphanVisits);
      const newNonOrphanNonBotVisits = newNonOrphanTotalVisits - newNonOrphanBotVisits;

      const newOrphanTotalVisits = newOrphanVisits.length;
      const newOrphanBotVisits = countBots(newOrphanVisits);
      const newOrphanNonBotVisits = newOrphanTotalVisits - newOrphanBotVisits;

      return {
        ...rest,
        nonOrphanVisits: {
          total: nonOrphanVisits.total + newNonOrphanTotalVisits,
          bots: nonOrphanVisits.bots + newNonOrphanBotVisits,
          nonBots: nonOrphanVisits.nonBots + newNonOrphanNonBotVisits,
        },
        orphanVisits: {
          total: orphanVisits.total + newOrphanTotalVisits,
          bots: orphanVisits.bots + newOrphanBotVisits,
          nonBots: orphanVisits.nonBots + newOrphanNonBotVisits,
        },
      };
    });
  },
});
