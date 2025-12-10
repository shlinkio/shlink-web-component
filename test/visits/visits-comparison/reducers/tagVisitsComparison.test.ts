import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit } from '../../../../src/api-contract';
import { formatIsoDate } from '../../../../src/utils/dates/helpers/date';
import { rangeOf } from '../../../../src/utils/helpers';
import { createNewVisits } from '../../../../src/visits/reducers/visitCreation';
import {
  cancelGetTagVisitsForComparison,
  getTagVisitsForComparisonThunk as getTagVisitsForComparison,
  tagVisitsComparisonReducer as reducer,
} from '../../../../src/visits/visits-comparison/reducers/tagVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('tagVisitsComparisonReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getTagVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getTagVisits: getTagVisitsCall });

  describe('reducer', () => {
    it('returns loading when idle', () => {
      const action = getTagVisitsForComparison.pending('', fromPartial({ tags: [] }));
      const { status } = reducer(fromPartial({ status: 'idle' }), action);

      expect(status).toEqual('loading');
    });

    it('returns canceled status when load is canceled', () => {
      const { status } = reducer(fromPartial({ status: 'loading' }), cancelGetTagVisitsForComparison());
      expect(status).toEqual('canceled');
    });

    it('stops loading and returns error when rejected', () => {
      const result = reducer(
        fromPartial({ status: 'loading' }),
        getTagVisitsForComparison.rejected(problemDetailsError, '', fromPartial({ tags: [] })),
      );

      expect(result).toEqual({ status: 'error', error: problemDetailsError });
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        foo: visitsMocks,
        bar: visitsMocks,
      };
      const result = reducer(
        fromPartial({ status: 'loading' }),
        getTagVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          fromPartial({ tags: ['foo', 'bar'] }),
          undefined,
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
      const result = reducer(fromPartial({ status: prevStatus }), getTagVisitsForComparison.progressChanged(85));
      expect(result).toEqual(expectedResult);
    });

    it.each([
      // No query. Tag matches foo. Visits prepended to foo
      [{}, 'foo', visitsMocks.length + 1, visitsMocks.length],
      // No query. Tag matches bar. Visits prepended to bar
      [{}, 'bar', visitsMocks.length, visitsMocks.length + 1],
      // No query. No tag match. No new visits prepended
      [{}, 'baz', visitsMocks.length, visitsMocks.length],
      // Query filter in the past. Tag matches foo. No new visits prepended
      [{ endDate: subDays(now, 1) }, 'foo', visitsMocks.length, visitsMocks.length],
      // Query filter in the future. Tag matches foo. No new visits prepended
      [{ startDate: addDays(now, 1) }, 'foo', visitsMocks.length, visitsMocks.length],
      // Query filter with start and end in the past. Tag matches foo. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: subDays(now, 2) },
        'foo',
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Tag matches foo. Visits prepended to foo
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'foo',
        visitsMocks.length + 1,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Tag matches bar. Visits prepended to bar
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'bar',
        visitsMocks.length,
        visitsMocks.length + 1,
      ],
      // Query filter with start and end in the present. No tag match. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'baz',
        visitsMocks.length,
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (dateRange, shortUrlTag, expectedFooVisits, expectedBarVisits) => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        foo: visitsMocks,
        bar: visitsMocks,
      };
      const shortUrl = fromPartial<ShlinkShortUrl>({ tags: [shortUrlTag] });
      const result = reducer(
        { visitsGroups: actionVisits, params: { dateRange }, status: 'loaded' },
        createNewVisits([fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } })]),
      );

      expect(result.status).toEqual('loaded');
      if (result.status === 'loaded') {
        expect(result.visitsGroups.foo).toHaveLength(expectedFooVisits);
        expect(result.visitsGroups.bar).toHaveLength(expectedBarVisits);
      }
    });
  });

  describe('getTagVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      tagVisitsComparison: { status: 'idle' },
    });

    it('dispatches start and success when promise is resolved', async () => {
      const visitsGroups = {
        foo: visitsMocks,
        bar: visitsMocks,
        baz: visitsMocks,
      };
      const tags = Object.keys(visitsGroups);
      const getVisitsComparisonParam = { tags, params: {}, apiClientFactory };

      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisitsForComparison(getVisitsComparisonParam)(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { ...getVisitsComparisonParam, visitsGroups },
      }));
      expect(getTagVisitsCall).toHaveBeenCalledTimes(tags.length);
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
