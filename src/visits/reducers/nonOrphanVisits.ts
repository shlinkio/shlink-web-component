import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
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
  createLoaders: ({ options }) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = async (query: ShlinkVisitsParams) => apiClient.getNonOrphanVisits(query);
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getNonOrphanVisits(q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().orphanVisits.cancelLoad,
});

export const nonOrphanVisitsReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getNonOrphanVisits>,
) => createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  asyncThunkCreator,
  filterCreatedVisits: ({ params }, createdVisits) => {
    const { startDate, endDate } = params?.dateRange ?? {};
    return createdVisits.filter(({ visit }) => isBetween(visit.date, startDate, endDate));
  },
});
