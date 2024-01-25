import type { ShlinkApiClient, ShlinkOrphanVisit, ShlinkOrphanVisitType } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { isOrphanVisit, toApiParams } from '../helpers';
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
  cancelLoad: false,
  errorData: null,
  progress: null,
};

const matchesType = (visit: ShlinkOrphanVisit, orphanVisitsType?: ShlinkOrphanVisitType) =>
  !orphanVisitsType || orphanVisitsType === visit.type;

export const getOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getOrphanVisits`,
  createLoaders: ({ orphanVisitsType, params, options }: LoadOrphanVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getOrphanVisits(
      { ...toApiParams(params), page, itemsPerPage },
    ).then((result) => {
      const visits = result.data.filter((visit) => isOrphanVisit(visit) && matchesType(visit, orphanVisitsType));
      return { ...result, data: visits };
    });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (query) => apiClient.getOrphanVisits(query));

    return { visitsLoader, lastVisitLoader };
  },
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
  filterCreatedVisits: ({ params }, createdVisits) => {
    const { startDate, endDate } = params?.dateRange ?? {};
    return createdVisits.filter(({ visit, shortUrl }) => !shortUrl && isBetween(visit.date, startDate, endDate));
  },
});
