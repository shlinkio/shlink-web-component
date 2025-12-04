import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit } from '../../../../src/api-contract';
import { formatIsoDate } from '../../../../src/utils/dates/helpers/date';
import { rangeOf } from '../../../../src/utils/helpers';
import { createNewVisits } from '../../../../src/visits/reducers/visitCreation';
import {
  cancelGetDomainVisitsForComparison,
  domainVisitsComparisonReducer as reducer,
  getDomainVisitsForComparisonThunk as getDomainVisitsForComparison,
} from '../../../../src/visits/visits-comparison/reducers/domainVisitsComparison';
import { problemDetailsError } from '../../../__mocks__/ProblemDetailsError.mock';

describe('domainVisitsComparisonReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getDomainVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getDomainVisits: getDomainVisitsCall });

  describe('reducer', () => {
    it('returns loading when pending', () => {
      const action = getDomainVisitsForComparison.pending('', fromPartial({ domains: [] }));
      const { loading } = reducer(fromPartial({ loading: false }), action);

      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(fromPartial({ cancelLoad: false }), cancelGetDomainVisitsForComparison());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getDomainVisitsForComparison.rejected(problemDetailsError, '', fromPartial({ domains: [] })),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits groups when fulfilled', () => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        'foo.com': visitsMocks,
        'bar.com': visitsMocks,
      };
      const { loading, errorData, visitsGroups } = reducer(
        fromPartial({ loading: true, errorData: null }),
        getDomainVisitsForComparison.fulfilled(
          { visitsGroups: actionVisits },
          '',
          fromPartial({ domains: ['foo.com', 'bar.com'] }),
        ),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visitsGroups).toEqual(actionVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getDomainVisitsForComparison.progressChanged(85));
      expect(progress).toEqual(85);
    });

    it.each([
      // No query. Domain matches foo. Visits prepended to foo
      [{}, 'foo.com', visitsMocks.length + 1, visitsMocks.length],
      // No query. Domain matches bar. Visits prepended to bar
      [{}, 'bar.com', visitsMocks.length, visitsMocks.length + 1],
      // No query. No domain match. No new visits prepended
      [{}, 'baz.com', visitsMocks.length, visitsMocks.length],
      // Query filter in the past. Domain matches foo. No new visits prepended
      [{ endDate: subDays(now, 1) }, 'foo.com', visitsMocks.length, visitsMocks.length],
      // Query filter in the future. Domain matches foo. No new visits prepended
      [{ startDate: addDays(now, 1) }, 'foo.com', visitsMocks.length, visitsMocks.length],
      // Query filter with start and end in the past. Domain matches foo. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: subDays(now, 2) },
        'foo.com',
        visitsMocks.length,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Domain matches foo. Visits prepended to foo
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'foo.com',
        visitsMocks.length + 1,
        visitsMocks.length,
      ],
      // Query filter with start and end in the present. Domain matches bar. Visits prepended to bar
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'bar.com',
        visitsMocks.length,
        visitsMocks.length + 1,
      ],
      // Query filter with start and end in the present. No domain match. No new visits prepended
      [
        { startDate: subDays(now, 5), endDate: addDays(now, 3) },
        'baz.com',
        visitsMocks.length,
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (dateRange, shortUrlDomain, expectedFooVisits, expectedBarVisits) => {
      const actionVisits: Record<string, ShlinkVisit[]> = {
        'foo.com': visitsMocks,
        'bar.com': visitsMocks,
      };
      const shortUrl = fromPartial<ShlinkShortUrl>({ domain: shortUrlDomain });
      const { visitsGroups } = reducer(
        fromPartial({ visitsGroups: actionVisits, params: { dateRange } }),
        createNewVisits([fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } })]),
      );

      expect(visitsGroups['foo.com']).toHaveLength(expectedFooVisits);
      expect(visitsGroups['bar.com']).toHaveLength(expectedBarVisits);
    });
  });

  describe('getDomainVisitsForComparison', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({
      domainVisitsComparison: { cancelLoad: false },
    });

    it('dispatches start and success when promise is resolved', async () => {
      const visitsGroups = {
        foo: visitsMocks,
        bar: visitsMocks,
        baz: visitsMocks,
      };
      const domains = Object.keys(visitsGroups);
      const getVisitsComparisonParam = { domains, params: {}, apiClientFactory };

      getDomainVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getDomainVisitsForComparison(getVisitsComparisonParam)(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { ...getVisitsComparisonParam, visitsGroups },
      }));
      expect(getDomainVisitsCall).toHaveBeenCalledTimes(domains.length);
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(1, 'foo', expect.anything());
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(2, 'bar', expect.anything());
      expect(getDomainVisitsCall).toHaveBeenNthCalledWith(3, 'baz', expect.anything());
    });
  });
});
