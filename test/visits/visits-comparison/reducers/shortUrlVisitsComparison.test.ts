import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit } from '../../../../src/api-contract';
import { queryToShortUrl } from '../../../../src/short-urls/helpers';
import { formatIsoDate } from '../../../../src/utils/dates/helpers/date';
import { rangeOf } from '../../../../src/utils/helpers';
import { createNewVisits } from '../../../../src/visits/reducers/visitCreation';
import {
  cancelGetShortUrlVisitsComparison,
  getShortUrlVisitsForComparisonThunk as getShortUrlVisitsForComparison,
  shortUrlVisitsComparisonReducer as reducer,
} from '../../../../src/visits/visits-comparison/reducers/shortUrlVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('shortUrlVisitsComparisonReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getShortUrlVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getShortUrlVisits: getShortUrlVisitsCall });

  describe('reducer', () => {
    it('returns loading when idle', () => {
      const action = getShortUrlVisitsForComparison.pending('', fromPartial({ shortUrls: [] }));
      const { status } = reducer(fromPartial({ status: 'idle' }), action);

      expect(status).toEqual('loading');
    });

    it('returns canceled status when load is canceled', () => {
      const { status } = reducer(fromPartial({ status: 'loading' }), cancelGetShortUrlVisitsComparison());
      expect(status).toEqual('canceled');
    });

    it('stops loading and returns error when rejected', () => {
      const result = reducer(
        fromPartial({ status: 'loading' }),
        getShortUrlVisitsForComparison.rejected(problemDetailsError, '', fromPartial({ shortUrls: [] })),
      );

      expect(result).toEqual({ status: 'error', error: problemDetailsError });
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        DEFAULT__foo: visitsMocks,
        's.test__bar': visitsMocks,
      };
      const result = reducer(
        fromPartial({ status: 'loading' }),
        getShortUrlVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          fromPartial({
            shortUrls: [{ shortCode: 'foo' }, { shortCode: 'bar', domain: 's.test' }],
          }),
        ),
      );

      expect(result).toEqual({ status: 'loaded', visitsGroups: actionVisits });
    });

    it.each([
      {
        prevStatus: 'loading' as const,
        expectedResult: { status: 'loading', progress: 85 },
      },
      {
        prevStatus: 'canceled' as const,
        expectedResult: { status: 'canceled' },
      },
    ])('returns new progress when it changes and previous status is loading', ({ prevStatus, expectedResult }) => {
      const result = reducer(fromPartial({ status: prevStatus }), getShortUrlVisitsForComparison.progressChanged(85));
      expect(result).toEqual(expectedResult);
    });

    it.each([
      // No query. Short URL matches foo. Visits prepended to foo
      [{}, { shortCode: 'foo' }, visitsMocks.length + 1, visitsMocks.length],
      // No query. Short URL matches bar. Visits prepended to bar
      [{}, { shortCode: 'bar', domain: 's.test' }, visitsMocks.length, visitsMocks.length + 1],
      // // No query. No short URL match. No new visits prepended
      [{}, { shortCode: 'baz' }, visitsMocks.length, visitsMocks.length],
      // Query filter in the past. Short URL matches foo. No new visits prepended
      [
        { endDate: subDays(now, 1) },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter in the future. Short URL matches foo. No new visits prepended
      [
        { startDate: addDays(now, 1) },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the past. Short URL matches foo. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: subDays(now, 2) },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Short URL matches foo. Visits prepended to foo
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        { shortCode: 'foo' },
        visitsMocks.length + 1,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Short URL matches bar. Visits prepended to bar
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        { shortCode: 'bar', domain: 's.test' },
        visitsMocks.length,
        visitsMocks.length + 1,
      ],
      // Query filter with start and end in the present. No short URL match. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        { shortCode: 'foo', domain: 's.test' },
        visitsMocks.length,
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (dateRange, shortUrlId, expectedFooVisits, expectedBarVisits) => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        DEFAULT__foo: visitsMocks,
        's.test__bar': visitsMocks,
      };
      const shortUrl = fromPartial<ShlinkShortUrl>(shortUrlId);
      const result = reducer(
        { visitsGroups: actionVisits, params: { dateRange }, status: 'loaded' },
        createNewVisits([fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } })]),
      );

      expect(result.status).toEqual('loaded');
      if (result.status === 'loaded') {
        expect(result.visitsGroups.DEFAULT__foo).toHaveLength(expectedFooVisits);
        expect(result.visitsGroups['s.test__bar']).toHaveLength(expectedBarVisits);
      }
    });
  });

  describe('getShortUrlVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      shortUrlVisitsComparison: { status: 'idle' },
    });

    it('dispatches start and success when promise is resolved', async () => {
      const visitsGroups = {
        DEFAULT__foo: visitsMocks,
        DEFAULT__bar: visitsMocks,
        DEFAULT__baz: visitsMocks,
      };
      const shortUrls = Object.keys(visitsGroups).map(queryToShortUrl);
      const getVisitsComparisonParams = { shortUrls, params: {}, apiClientFactory };

      getShortUrlVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getShortUrlVisitsForComparison(getVisitsComparisonParams)(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { ...getVisitsComparisonParams, visitsGroups },
      }));
      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(shortUrls.length);

      const containingShortCode = (shortCode: string) => expect.objectContaining({ shortCode });
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(1, containingShortCode('foo'), expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(2, containingShortCode('bar'), expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(3, containingShortCode('baz'), expect.anything());
    });
  });
});
