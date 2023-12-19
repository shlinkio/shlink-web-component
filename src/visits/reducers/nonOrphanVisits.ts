import type { ShlinkApiClient } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisits';

const initialState: VisitsInfo = {
  visits: [],
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getNonOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getNonOrphanVisits`,
  createLoaders: ({ query = {}, doIntervalFallback = false }) => {
    const apiClient = apiClientFactory();
    const visitsLoader = async (page: number, itemsPerPage: number) =>
      apiClient.getNonOrphanVisits({ ...query, page, itemsPerPage });
    const lastVisitLoader = lastVisitLoaderForLoader(
      doIntervalFallback,
      (params) => apiClient.getNonOrphanVisits(params),
    );

    return [visitsLoader, lastVisitLoader];
  },
  getExtraFulfilledPayload: ({ query = {} }) => ({ query }),
  shouldCancel: (getState) => getState().orphanVisits.cancelLoad,
});

export const nonOrphanVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getNonOrphanVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  asyncThunkCreator,
  filterCreatedVisits: ({ query = {} }, createdVisits) => {
    const { startDate, endDate } = query;
    return createdVisits.filter(({ visit }) => isBetween(visit.date, startDate, endDate));
  },
});
