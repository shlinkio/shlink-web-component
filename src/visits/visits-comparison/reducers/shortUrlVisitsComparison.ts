import type { ShlinkApiClient } from '../../../api-contract';
import type { ShortUrlIdentifier } from '../../../short-urls/data';
import { queryToShortUrl, shortUrlMatches, shortUrlToQuery } from '../../../short-urls/helpers';
import { isBetween } from '../../../utils/dates/helpers/date';
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
    createLoaders: ({ shortUrls, query = {} }: LoadShortUrlVisitsForComparison) => {
      const apiClient = apiClientFactory();
      const loaderEntries = shortUrls.map((identifier) => [
        shortUrlToQuery(identifier),
        async (page: number, itemsPerPage: number) => apiClient.getShortUrlVisits(
          identifier.shortCode,
          { ...query, domain: identifier.domain, page, itemsPerPage },
        ),
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
  filterCreatedVisitsForGroup: ({ groupKey, query = {} }, createdVisits) => {
    const { shortCode, domain } = queryToShortUrl(groupKey);
    const { endDate, startDate } = query;
    return createdVisits.filter(
      ({ shortUrl, visit }) =>
        shortUrl && shortUrlMatches(shortUrl, shortCode, domain) && isBetween(visit.date, startDate, endDate),
    );
  },
});
