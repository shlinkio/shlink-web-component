import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit } from '../../../../src/api-contract';
import { queryToShortUrl } from '../../../../src/short-urls/helpers';
import { formatIsoDate } from '../../../../src/utils/dates/helpers/date';
import { rangeOf } from '../../../../src/utils/helpers';
import { createNewVisits } from '../../../../src/visits/reducers/visitCreation';
import {
  getShortUrlVisitsForComparison as getShortUrlVisitsForComparisonCreator,
  shortUrlVisitsComparisonReducerCreator,
} from '../../../../src/visits/visits-comparison/reducers/shortUrlVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('shortUrlVisitsComparisonReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getShortUrlVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getShortUrlVisits: getShortUrlVisitsCall });
  const getShortUrlVisitsForComparison = getShortUrlVisitsForComparisonCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetShortUrlVisitsForComparison } = shortUrlVisitsComparisonReducerCreator(
    getShortUrlVisitsForComparison,
  );

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getShortUrlVisitsForComparison.pending('', { shortUrls: [] }, undefined);
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetShortUrlVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getShortUrlVisitsForComparison.rejected(problemDetailsError, '', { shortUrls: [] }, undefined, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        DEFAULT__foo: visitsMocks,
        's.test__bar': visitsMocks,
      };
      const { loading, errorData, visitsGroups } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getShortUrlVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          { shortUrls: [{ shortCode: 'foo' }, { shortCode: 'bar', domain: 's.test' }] },
          undefined,
        ),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getShortUrlVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
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
        { endDate: formatIsoDate(subDays(now, 1)) ?? undefined },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter in the future. Short URL matches foo. No new visits prepended
      [
        { startDate: formatIsoDate(addDays(now, 1)) ?? undefined },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the past. Short URL matches foo. No new visits prepended
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(subDays(now, 2)) ?? undefined,
        },
        { shortCode: 'foo' },
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Short URL matches foo. Visits prepended to foo
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        { shortCode: 'foo' },
        visitsMocks.length + 1,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Short URL matches bar. Visits prepended to bar
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        { shortCode: 'bar', domain: 's.test' },
        visitsMocks.length,
        visitsMocks.length + 1,
      ],
      // Query filter with start and end in the present. No short URL match. No new visits prepended
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        { shortCode: 'foo', domain: 's.test' },
        visitsMocks.length,
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (query, shortUrlId, expectedFooVisits, expectedBarVisits) => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        DEFAULT__foo: visitsMocks,
        's.test__bar': visitsMocks,
      };
      const shortUrl = fromPartial<ShlinkShortUrl>(shortUrlId);
      const { visitsGroups } = reducer(fromPartial({ visitsGroups: actionVisits, query }), createNewVisits([
        fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } }),
      ]));

      expect(visitsGroups.DEFAULT__foo).toHaveLength(expectedFooVisits);
      expect(visitsGroups['s.test__bar']).toHaveLength(expectedBarVisits);
    });
  });

  describe('getShortUrlVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      shortUrlVisitsComparison: { cancelLoad: false },
    });

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visitsGroups = {
        DEFAULT__foo: visitsMocks,
        DEFAULT__bar: visitsMocks,
        DEFAULT__baz: visitsMocks,
      };
      const shortUrls = Object.keys(visitsGroups).map(queryToShortUrl);

      getShortUrlVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getShortUrlVisitsForComparison({ shortUrls, query })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visitsGroups, query },
      }));
      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(shortUrls.length);
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getShortUrlVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
