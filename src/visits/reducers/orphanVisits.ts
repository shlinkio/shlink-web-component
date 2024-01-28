import type { ShlinkVisits } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient, ShlinkOrphanVisit, ShlinkOrphanVisitType } from '../../api-contract';
import { isBetween } from '../../utils/dates/helpers/date';
import { isMandatoryStartDateRangeParams, isOrphanVisit, paramsForPrevDateRange, toApiParams } from '../helpers';
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

const filterOrphanVisitsByType = ({ data, ...rest }: ShlinkVisits, type?: ShlinkOrphanVisitType) => {
  const visits = data.filter((visit) => isOrphanVisit(visit) && matchesType(visit, type));
  return { ...rest, data: visits };
};

export const getOrphanVisits = (apiClientFactory: () => ShlinkApiClient) => createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getOrphanVisits`,
  createLoaders: ({ orphanVisitsType, params, options }: LoadOrphanVisits) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false, loadPrevInterval } = options;
    const query = toApiParams(params);
    const queryForPrevVisits = loadPrevInterval && isMandatoryStartDateRangeParams(params)
      ? toApiParams(paramsForPrevDateRange(params))
      : undefined;

    const visitsLoader = async (page: number, itemsPerPage: number) => apiClient.getOrphanVisits(
      { ...query, page, itemsPerPage },
    ).then((resp) => filterOrphanVisitsByType(resp, orphanVisitsType));
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getOrphanVisits(q));
    const prevVisitsLoader = queryForPrevVisits && (
      (page: number, itemsPerPage: number) => apiClient.getOrphanVisits({ ...queryForPrevVisits, page, itemsPerPage })
        .then((resp) => filterOrphanVisitsByType(resp, orphanVisitsType))
    );

    return { visitsLoader, lastVisitLoader, prevVisitsLoader };
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
