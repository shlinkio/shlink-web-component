import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { useApiClientFactory } from '../../store/helpers';
import { isBetween } from '../../utils/dates/helpers/date';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import { deleteOrphanVisitsThunk } from './orphanVisitsDeletion';
import type { LoadWithDomainVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisits';

export interface LoadOrphanVisits extends LoadWithDomainVisits {
  orphanVisitsType?: ShlinkOrphanVisitType;
}

const initialState: VisitsInfo = {
  visits: [],
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getOrphanVisitsThunk = createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getOrphanVisits`,
  createLoaders: ({ orphanVisitsType, domain, options, apiClientFactory }: WithApiClient<LoadOrphanVisits>) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = async (query: ShlinkVisitsParams) => apiClient.getOrphanVisits({
      ...query,
      type: orphanVisitsType,
      domain,
    });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getOrphanVisits(q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().orphanVisits.cancelLoad,
});

export const { reducer: orphanVisitsReducer, cancelGetVisits: cancelGetOrphanVisits } = createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunk: getOrphanVisitsThunk,
  extraReducers: (builder) => {
    builder.addCase(deleteOrphanVisitsThunk.fulfilled, (state) => ({ ...state, visits: [] }));
  },
  filterCreatedVisits: ({ params }, createdVisits) => {
    const { startDate, endDate } = params?.dateRange ?? {};
    return createdVisits.filter(({ visit, shortUrl }) => !shortUrl && isBetween(visit.date, startDate, endDate));
  },
});

export const useOrphanVisits = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getOrphanVisits = useCallback(
    (data: LoadOrphanVisits) => dispatch(getOrphanVisitsThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchCancelGetOrphanVisits = useCallback(() => dispatch(cancelGetOrphanVisits()), [dispatch]);
  const orphanVisits = useAppSelector((state) => state.orphanVisits);

  return { orphanVisits, getOrphanVisits, cancelGetOrphanVisits: dispatchCancelGetOrphanVisits };
};
