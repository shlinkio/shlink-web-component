import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkVisit, ShlinkVisitsList } from '../../../src/api-contract';
import { DEFAULT_DOMAIN } from '../../../src/domains/data';
import type { RootState } from '../../../src/store';
import type { WithApiClient } from '../../../src/store/helpers';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import type { DomainVisits, LoadDomainVisits } from '../../../src/visits/reducers/domainVisits';
import {
  cancelGetDomainVisits,
  domainVisitsReducer as reducer,
  getDomainVisitsThunk as getDomainVisits,
} from '../../../src/visits/reducers/domainVisits';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('domainVisitsReducer', () => {
  const now = new Date();
  const dateForVisit = (day: number) => `2020-01-1${day}T00:00:00Z`;
  const visitsMocks = rangeOf(2, (index) => fromPartial<ShlinkVisit>({ date: dateForVisit(index) }));
  const getDomainVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getDomainVisits: getDomainVisitsCall });

  describe('reducer', () => {
    const buildState = (data: Partial<DomainVisits>) => fromPartial<DomainVisits>(data);

    it('returns loading when idle', () => {
      const { status } = reducer(
        buildState({ status: 'idle' }),
        getDomainVisits.pending('', fromPartial({})),
      );
      expect(status).toEqual('loading');
    });

    it('returns canceled status when load is canceled', () => {
      const { status } = reducer(buildState({ status: 'loading' }), cancelGetDomainVisits());
      expect(status).toEqual('canceled');
    });

    it('stops loading and returns error when rejected', () => {
      const result = reducer(
        buildState({ status: 'loading' }),
        getDomainVisits.rejected(problemDetailsError, '', fromPartial({})),
      );

      expect(result).toEqual({ status: 'error', error: problemDetailsError });
    });

    it('return visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const result = reducer(
        buildState({ status: 'loading' }),
        getDomainVisits.fulfilled({ visits: actionVisits }, '', fromPartial({}), undefined),
      );

      expect(result).toEqual({ status: 'loaded', visits: actionVisits });
    });

    it.each([
      [{ domain: 'foo.com' }, 'foo.com', visitsMocks.length + 1],
      [{ domain: 'bar.com' }, 'foo.com', visitsMocks.length],
      [fromPartial<DomainVisits>({ domain: 'foo.com' }), 'foo.com', visitsMocks.length + 1],
      [fromPartial<DomainVisits>({ domain: DEFAULT_DOMAIN }), null, visitsMocks.length + 1],
      [
        fromPartial<DomainVisits>({
          domain: 'foo.com',
          params: {
            dateRange: { endDate: subDays(now, 1) },
          },
        }),
        'foo.com',
        visitsMocks.length,
      ],
      [
        fromPartial<DomainVisits>({
          domain: 'foo.com',
          params: {
            dateRange: { startDate: addDays(now, 1) },
          },
        }),
        'foo.com',
        visitsMocks.length,
      ],
      [
        fromPartial<DomainVisits>({
          domain: 'foo.com',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: subDays(now, 2),
            },
          },
        }),
        'foo.com',
        visitsMocks.length,
      ],
      [
        fromPartial<DomainVisits>({
          domain: 'foo.com',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        'foo.com',
        visitsMocks.length + 1,
      ],
      [
        fromPartial<DomainVisits>({
          domain: 'bar.com',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        'foo.com',
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (state, shortUrlDomain, expectedVisits) => {
      const shortUrl = fromPartial<ShlinkShortUrl>({ domain: shortUrlDomain });
      const result = reducer(buildState({ ...state, status: 'loaded', visits: visitsMocks }), createNewVisits([
        fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } }),
      ]));

      expect(result.status).toEqual('loaded');
      if (result.status === 'loaded') {
        expect(result.visits).toHaveLength(expectedVisits);
      }
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
      const result = reducer(buildState({ status: prevStatus }), getDomainVisits.progressChanged(85));
      expect(result).toEqual(expectedResult);
    });

    it('returns fallbackInterval when falling back to another interval', () => {
      const fallbackInterval: DateInterval = 'last30Days';
      const state = reducer(
        undefined,
        getDomainVisits.fallbackToInterval(fallbackInterval),
      );

      expect(state).toEqual(expect.objectContaining({ fallbackInterval }));
    });
  });

  describe('getDomainVisits', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({
      domainVisits: { status: 'idle' },
    });
    const domain = 'foo.com';

    it('dispatches start and success when promise is resolved', async () => {
      const visits = visitsMocks;
      const getVisitsParam = { domain, params: {}, options: {}, apiClientFactory };

      getDomainVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getDomainVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits, ...getVisitsParam },
      }));
      expect(getDomainVisitsCall).toHaveBeenCalledOnce();
    });

    it.each([
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 20)) })],
        getDomainVisits.fallbackToInterval('last30Days'),
        3,
      ],
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 100)) })],
        getDomainVisits.fallbackToInterval('last180Days'),
        3,
      ],
      [[], expect.objectContaining({ type: getDomainVisits.fulfilled.toString() }), 2],
    ])('dispatches fallback interval when the list of visits is empty', async (
      lastVisits,
      expectedSecondDispatch,
      expectedDispatchCalls,
    ) => {
      const buildVisitsResult = (data: ShlinkVisit[] = []): ShlinkVisitsList => ({
        data,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });
      getDomainVisitsCall
        .mockResolvedValueOnce(buildVisitsResult())
        .mockResolvedValueOnce(buildVisitsResult(lastVisits));

      await getDomainVisits(
        { domain, params: {}, options: { doIntervalFallback: true }, apiClientFactory },
      )(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getDomainVisitsCall).toHaveBeenCalledTimes(2);
    });

    it.each([
      // Strict date range and loadPrevInterval: true -> prev visits are loaded
      {
        dateRange: { startDate: subDays(now, 1), endDate: addDays(now, 1) },
        loadPrevInterval: true,
        expectsPrevVisits: true,
      },
      // Undefined date range and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: undefined,
        loadPrevInterval: true,
        expectsPrevVisits: false,
      },
      // Empty date range and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: {},
        loadPrevInterval: true,
        expectsPrevVisits: false,
      },
      // Start date only and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: { startDate: subDays(now, 2) },
        loadPrevInterval: true,
        expectsPrevVisits: true,
      },
      // End date only and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: { endDate: now },
        loadPrevInterval: true,
        expectsPrevVisits: false,
      },
      // Strict date range and loadPrevInterval: false -> prev visits are NOT loaded
      {
        dateRange: { startDate: subDays(now, 1), endDate: addDays(now, 1) },
        loadPrevInterval: false,
        expectsPrevVisits: false,
      },
    ])('returns visits from prev interval when requested and possible', async (
      { dateRange, loadPrevInterval, expectsPrevVisits },
    ) => {
      const getVisitsParam: WithApiClient<LoadDomainVisits> = {
        domain,
        params: { dateRange },
        options: { loadPrevInterval },
        apiClientFactory,
      };
      const prevVisits = expectsPrevVisits ? visitsMocks.map(
        (visit, index) => ({ ...visit, date: dateForVisit(index + 1 + visitsMocks.length) }),
      ) : undefined;

      getDomainVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getDomainVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: visitsMocks, prevVisits, ...getVisitsParam },
      }));
      expect(getDomainVisitsCall).toHaveBeenCalledTimes(expectsPrevVisits ? 2 : 1);
    });
  });
});
