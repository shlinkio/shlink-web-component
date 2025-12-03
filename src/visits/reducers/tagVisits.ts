import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import type { WithApiClient } from '../../store/helpers';
import { useApiClientFactory } from '../../store/helpers';
import { filterCreatedVisitsByTag } from '../helpers';
import { createVisitsAsyncThunk, createVisitsReducer, lastVisitLoaderForLoader } from './common';
import type { LoadWithDomainVisits, VisitsInfo } from './types';

const REDUCER_PREFIX = 'shlink/tagVisits';

type WithTag = {
  tag: string;
};

export type TagVisits = VisitsInfo & WithTag;

const initialState: TagVisits = {
  visits: [],
  tag: '',
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export type LoadTagVisits = LoadWithDomainVisits & WithTag;

export const getTagVisitsThunk = createVisitsAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisits`,
  createLoaders: ({ tag, options, domain, apiClientFactory }: WithApiClient<LoadTagVisits>) => {
    const apiClient = apiClientFactory();
    const { doIntervalFallback = false } = options;

    const visitsLoader = (query: ShlinkVisitsParams) => apiClient.getTagVisits(tag, { ...query, domain });
    const lastVisitLoader = lastVisitLoaderForLoader(doIntervalFallback, async (q) => apiClient.getTagVisits(tag, q));

    return { visitsLoader, lastVisitLoader };
  },
  shouldCancel: (getState) => getState().tagVisits.cancelLoad,
});

export const { reducer: tagVisitsReducer, cancelGetVisits: cancelGetTagVisits } = createVisitsReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunk: getTagVisitsThunk,
  filterCreatedVisits: ({ tag, params }: TagVisits, createdVisits) => filterCreatedVisitsByTag(
    createdVisits,
    tag,
    params?.dateRange,
  ),
});

export const useTagVisits = () => {
  const dispatch = useAppDispatch();
  const apiClientFactory = useApiClientFactory();
  const getTagVisits = useCallback(
    (data: LoadTagVisits) => dispatch(getTagVisitsThunk({ ...data, apiClientFactory })),
    [apiClientFactory, dispatch],
  );
  const dispatchCancelGetTagVisits = useCallback(() => dispatch(cancelGetTagVisits()), [dispatch]);
  const tagVisits = useAppSelector((state) => state.tagVisits);

  return { tagVisits, getTagVisits, cancelGetTagVisits: dispatchCancelGetTagVisits };
};
