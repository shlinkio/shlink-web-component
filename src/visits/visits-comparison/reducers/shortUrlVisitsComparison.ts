import type { ShlinkVisitsParams } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient } from '../../../api-contract';
import type { ShortUrlIdentifier } from '../../../short-urls/data';
import { queryToShortUrl, shortUrlToQuery } from '../../../short-urls/helpers';
import { filterCreatedVisitsByShortUrl } from '../../helpers';
import { createVisitsComparisonAsyncThunk } from './common/createVisitsComparisonAsyncThunk';
import { createVisitsComparisonReducer } from './common/createVisitsComparisonReducer';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './types';

const REDUCER_PREFIX = 'shlink/shortUrlVisitsComparison';

export type LoadShortUrlVisitsForComparison = LoadVisitsForComparison & { shortUrls: ShortUrlIdentifier[]; };

const initialState: VisitsComparisonInfo = {
  visitsGroups: {},
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getShortUrlVisitsForComparison = (apiClientFactory: () => ShlinkApiClient) =>
  createVisitsComparisonAsyncThunk({
    typePrefix: `${REDUCER_PREFIX}/getShortUrlVisitsForComparison`,
    createLoaders: ({ shortUrls }: LoadShortUrlVisitsForComparison) => {
      const apiClient = apiClientFactory();
      const loaderEntries = shortUrls.map((identifier) => [
        shortUrlToQuery(identifier),
        (query: ShlinkVisitsParams) => apiClient.getShortUrlVisits(identifier, query),
      ]);

      return Object.fromEntries(loaderEntries);
    },
    shouldCancel: (getState) => getState().shortUrlVisitsComparison.cancelLoad,
  });

export const shortUrlVisitsComparisonReducerCreator = (
  asyncThunkCreator: ReturnType<typeof getShortUrlVisitsForComparison>,
) => createVisitsComparisonReducer({
  name: REDUCER_PREFIX,
  initialState,
  // @ts-expect-error TODO Fix type inference
  asyncThunkCreator,
  filterCreatedVisitsForGroup: ({ groupKey, params }, createdVisits) => filterCreatedVisitsByShortUrl(
    createdVisits,
    queryToShortUrl(groupKey),
    params?.dateRange,
  ),
});
