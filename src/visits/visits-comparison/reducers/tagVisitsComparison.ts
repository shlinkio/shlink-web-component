import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import type { WithApiClient } from '../../../store/helpers';
import { useApiClientFactory } from '../../../store/helpers';
import { filterCreatedVisitsByTag } from '../../helpers';
import { createVisitsComparisonAsyncThunk } from './common/createVisitsComparisonAsyncThunk';
import { createVisitsComparisonReducer } from './common/createVisitsComparisonReducer';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './types';

const REDUCER_PREFIX = 'shlink/tagVisitsComparison';

export type LoadTagVisitsForComparison = LoadVisitsForComparison & { tags: string[]; };

const initialState: VisitsComparisonInfo = {
  visitsGroups: {},
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getTagVisitsForComparisonThunk = createVisitsComparisonAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisitsForComparison`,
  createLoaders: ({ tags, apiClientFactory }: WithApiClient<LoadTagVisitsForComparison>) => {
    const apiClient = apiClientFactory();
    const loaderEntries = tags.map((tag) => [
      tag,
      (query: ShlinkVisitsParams) => apiClient.getTagVisits(tag, query),
    ]);

    return Object.fromEntries(loaderEntries);
  },
  shouldCancel: (getState) => getState().tagVisitsComparison.cancelLoad,
});

export const {
  reducer: tagVisitsComparisonReducer,
  cancelGetVisits: cancelGetTagVisitsForComparison,
} = createVisitsComparisonReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunk: getTagVisitsForComparisonThunk,
  filterCreatedVisitsForGroup: ({ groupKey: tag, params }, createdVisits) => filterCreatedVisitsByTag(
    createdVisits,
    tag,
    params?.dateRange,
  ),
});

export const useTagVisitsComparison = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getTagVisitsForComparison = useCallback(
    (data: LoadTagVisitsForComparison) => dispatch(getTagVisitsForComparisonThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const cancelGetVisits = useCallback(() => dispatch(cancelGetTagVisitsForComparison()), [dispatch]);
  const tagVisitsComparison = useAppSelector((state) => state.tagVisitsComparison);

  return { tagVisitsComparison, getTagVisitsForComparison, cancelGetTagVisitsForComparison: cancelGetVisits };
};
