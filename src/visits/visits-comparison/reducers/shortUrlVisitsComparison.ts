import { useCallback } from 'react';
import type { ShlinkShortUrlIdentifier, ShlinkVisitsParams } from '../../../api-contract';
import { queryToShortUrl, shortUrlToQuery } from '../../../short-urls/helpers';
import { useAppDispatch, useAppSelector } from '../../../store';
import type { WithApiClient } from '../../../store/helpers';
import { useApiClientFactory } from '../../../store/helpers';
import { filterCreatedVisitsByShortUrl } from '../../helpers';
import { createVisitsComparisonAsyncThunk } from './common/createVisitsComparisonAsyncThunk';
import { createVisitsComparisonReducer } from './common/createVisitsComparisonReducer';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisitsComparison';

export type LoadShortUrlVisitsForComparison = LoadVisitsForComparison & { shortUrls: ShlinkShortUrlIdentifier[]; };

const initialState: VisitsComparisonInfo = {
  status: 'idle',
};

export const getShortUrlVisitsForComparisonThunk = createVisitsComparisonAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getShortUrlVisitsForComparison`,
  createLoaders: ({ shortUrls, apiClientFactory }: WithApiClient<LoadShortUrlVisitsForComparison>) => {
    const apiClient = apiClientFactory();
    const loaderEntries = shortUrls.map((identifier) => [
      shortUrlToQuery(identifier),
      (query: ShlinkVisitsParams) => apiClient.getShortUrlVisits(identifier, query),
    ]);

    return Object.fromEntries(loaderEntries);
  },
  shouldCancel: (getState) => getState().shortUrlVisitsComparison.status === 'canceled',
});

export const {
  reducer: shortUrlVisitsComparisonReducer,
  cancelGetVisits: cancelGetShortUrlVisitsComparison,
} = createVisitsComparisonReducer({
  name: REDUCER_PREFIX,
  initialState: initialState as VisitsComparisonInfo,
  asyncThunk: getShortUrlVisitsForComparisonThunk,
  filterCreatedVisitsForGroup: ({ groupKey, params }, createdVisits) => filterCreatedVisitsByShortUrl(
    createdVisits,
    queryToShortUrl(groupKey),
    params?.dateRange,
  ),
});

export const useUrlVisitsComparison = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getShortUrlVisitsForComparison = useCallback(
    (data: LoadShortUrlVisitsForComparison) => dispatch(getShortUrlVisitsForComparisonThunk(
      { ...data, apiClientFactory },
    )),
    [apiClientFactory, dispatch],
  );
  const cancelGetVisits = useCallback(() => dispatch(cancelGetShortUrlVisitsComparison()), [dispatch]);
  const shortUrlVisitsComparison = useAppSelector((state) => state.shortUrlVisitsComparison);

  return {
    shortUrlVisitsComparison,
    getShortUrlVisitsForComparison,
    cancelGetShortUrlVisitsComparison: cancelGetVisits,
  };
};
