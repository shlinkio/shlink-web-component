import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit } from '../../../../src/api-contract';
import { formatIsoDate } from '../../../../src/utils/dates/helpers/date';
import { rangeOf } from '../../../../src/utils/helpers';
import { createNewVisits } from '../../../../src/visits/reducers/visitCreation';
import {
  getTagVisitsForComparison as getTagVisitsForComparisonCreator,
  tagVisitsComparisonReducerCreator,
} from '../../../../src/visits/visits-comparison/reducers/tagVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('tagVisitsComparisonReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getTagVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getTagVisits: getTagVisitsCall });
  const getTagVisitsForComparison = getTagVisitsForComparisonCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetTagVisitsForComparison } = tagVisitsComparisonReducerCreator(
    getTagVisitsForComparison,
  );

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getTagVisitsForComparison.pending('', { tags: [] }, undefined);
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetTagVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getTagVisitsForComparison.rejected(problemDetailsError, '', { tags: [] }, undefined, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        foo: visitsMocks,
        bar: visitsMocks,
      };
      const { loading, errorData, visitsGroups } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getTagVisitsForComparison.fulfilled({ visitsGroups: actionVisits }, '', { tags: ['foo', 'bar'] }, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getTagVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
    });

    it.each([
      // No query. Tag matches foo. Visits prepended to foo
      [{}, 'foo', visitsMocks.length + 1, visitsMocks.length],
      // No query. Tag matches bar. Visits prepended to bar
      [{}, 'bar', visitsMocks.length, visitsMocks.length + 1],
      // No query. No tag match. No new visits prepended
      [{}, 'baz', visitsMocks.length, visitsMocks.length],
      // Query filter in the past. Tag matches foo. No new visits prepended
      [{ endDate: formatIsoDate(subDays(now, 1)) ?? undefined }, 'foo', visitsMocks.length, visitsMocks.length],
      // Query filter in the future. Tag matches foo. No new visits prepended
      [{ startDate: formatIsoDate(addDays(now, 1)) ?? undefined }, 'foo', visitsMocks.length, visitsMocks.length],
      // Query filter with start and end in the past. Tag matches foo. No new visits prepended
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(subDays(now, 2)) ?? undefined,
        },
        'foo',
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Tag matches foo. Visits prepended to foo
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        'foo',
        visitsMocks.length + 1,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Tag matches bar. Visits prepended to bar
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        'bar',
        visitsMocks.length,
        visitsMocks.length + 1,
      ],
      // Query filter with start and end in the present. No tag match. No new visits prepended
      [
        {
          startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
          endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
        },
        'baz',
        visitsMocks.length,
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (query, shortUrlTag, expectedFooVisits, expectedBarVisits) => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        foo: visitsMocks,
        bar: visitsMocks,
      };
      const shortUrl = fromPartial<ShlinkShortUrl>({ tags: [shortUrlTag] });
      const { visitsGroups } = reducer(fromPartial({ visitsGroups: actionVisits, query }), createNewVisits([
        fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } }),
      ]));

      expect(visitsGroups.foo).toHaveLength(expectedFooVisits);
      expect(visitsGroups.bar).toHaveLength(expectedBarVisits);
    });
  });

  describe('getTagVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      tagVisitsComparison: { cancelLoad: false },
    });

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visitsGroups = {
        foo: visitsMocks,
        bar: visitsMocks,
        baz: visitsMocks,
      };
      const tags = Object.keys(visitsGroups);

      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisitsForComparison({ tags, query })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visitsGroups, query },
      }));
      expect(getTagVisitsCall).toHaveBeenCalledTimes(tags.length);
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getTagVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
