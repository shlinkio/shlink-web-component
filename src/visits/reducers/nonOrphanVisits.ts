import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { useApiClientFactory } from '../../store/helpers';
import { isBetween } from '../../utils/dates/helpers/date';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadWithDomainVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/orphanVisits';

const initialState: VisitsInfo = {
  status: 'idle',
};

export const getNonOrphanVisitsThunk = createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getNonOrphanVisits`,
  createLoaders: ({ options, domain, apiClientFactory }: WithApiClient<LoadWithDomainVisits>) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = async (query: ShlinkVisitsParams) => apiClient.getNonOrphanVisits({ ...query, domain });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, (q) => apiClient.getNonOrphanVisits(q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().nonOrphanVisits.status === 'canceled',
});

export const { reducer: nonOrphanVisitsReducer, cancelGetVisits: cancelGetNonOrphanVisits } = createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState: initialState as VisitsInfo,
  asyncThunk: getNonOrphanVisitsThunk,
  filterCreatedVisits: (state, createdVisits) => {
    if (state.status !== 'loaded') {
      return createdVisits;
    }

    const { startDate, endDate } = state.params?.dateRange ?? {};
    return createdVisits.filter(({ visit }) => isBetween(visit.date, startDate, endDate));
  },
});

export const useNonOrphanVisits = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getNonOrphanVisits = useCallback(
    (data: LoadWithDomainVisits) => dispatch(getNonOrphanVisitsThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchCancelGetNonOrphanVisits = useCallback(() => dispatch(cancelGetNonOrphanVisits()), [dispatch]);
  const nonOrphanVisits = useAppSelector((state) => state.nonOrphanVisits);

  return { nonOrphanVisits, getNonOrphanVisits, cancelGetNonOrphanVisits: dispatchCancelGetNonOrphanVisits };
};
