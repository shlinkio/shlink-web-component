import type { ShlinkVisitsList, ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient, ShlinkOrphanVisit, ShlinkOrphanVisitType } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { isOrphanVisit } from '../helpers';
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

const filterOrphanVisitsByType = ({ data, ...rest }: ShlinkVisitsList, type?: ShlinkOrphanVisitType) => {
  const visits = data.filter((visit) => isOrphanVisit(visit) && matchesType(visit, type));
  return { ...rest, data: visits };
};

export const getOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getOrphanVisits`,
  createLoaders: ({ orphanVisitsType, options }: LoadOrphanVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = async (query: ShlinkVisitsParams) => apiClient.getOrphanVisits(query).then(
      (resp) => filterOrphanVisitsByType(resp, orphanVisitsType),
    );
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getOrphanVisits(q));

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
