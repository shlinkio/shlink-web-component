import type { ShlinkApiClient, ShlinkOrphanVisit, ShlinkOrphanVisitType } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { isOrphanVisit } from '../types/helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { deleteOrphanVisits } from './orphanVisitsDeletion';
import type { LoadVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisits';

export interface LoadOrphanVisits extends LoadVisits {
  orphanVisitsType?: ShlinkOrphanVisitType;
}

const initialState: VisitsInfo = {
  visits: [],
  loading: false,
  error: false,
  cancelLoad: false,
  progress: null,
};

const matchesType = (visit: ShlinkOrphanVisit, orphanVisitsType?: ShlinkOrphanVisitType) =>
  !orphanVisitsType || orphanVisitsType === visit.type;

export const getOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getOrphanVisits`,
  createLoaders: ({ orphanVisitsType, query = {}, doIntervalFallback = false }: LoadOrphanVisits) => {
    const apiClient = apiClientFactory();
    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getOrphanVisits(
      { ...query, page, itemsPerPage },
    ).then((result) => {
      const visits = result.data.filter((visit) => isOrphanVisit(visit) && matchesType(visit, orphanVisitsType));
      return { ...result, data: visits };
    });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (params) => apiClient.getOrphanVisits(params));

    return [visitsLoader, lastVisitLoader];
  },
  getExtraFulfilledPayload: ({ query = {} }: LoadOrphanVisits) => ({ query }),
  shouldCancel: (getState) => getState().orphanVisits.cancelLoad,
});

export const orphanVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getOrphanVisits>,
  deleteOrphanVisitsThunk: ReturnType<typeof deleteOrphanVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  asyncThunkCreator,
  extraReducers: (builder) => {
    builder.addCase(deleteOrphanVisitsThunk.fulfilled, (state) => ({ ...state, visits: [] }));
  },
  filterCreatedVisits: ({ query = {} }, createdVisits) => {
    const { startDate, endDate } = query;
    return createdVisits.filter(({ visit, shortUrl }) => !shortUrl && isBetween(visit.date, startDate, endDate));
  },
});
