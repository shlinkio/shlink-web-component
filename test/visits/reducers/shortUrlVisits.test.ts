import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkVisit, ShlinkVisitsList } from '../../../src/api-contract';
import type { RootState } from '../../../src/store';
import type { WithApiClient } from '../../../src/store/helpers';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import type { LoadShortUrlVisits, ShortUrlVisits } from '../../../src/visits/reducers/shortUrlVisits';
import {
  cancelGetVisits as cancelGetShortUrlVisits,
  getShortUrlVisitsThunk as getShortUrlVisits,
  shortUrlVisitsReducer as reducer,
} from '../../../src/visits/reducers/shortUrlVisits';
import { deleteShortUrlVisitsThunk } from '../../../src/visits/reducers/shortUrlVisitsDeletion';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('shortUrlVisitsReducer', () => {
  const now = new Date();
  const dateForVisit = (day: number) => `2020-01-1${day}T00:00:00Z`;
  const visitsMocks = rangeOf(2, (index) => fromPartial<ShlinkVisit>({ date: dateForVisit(index) }));
  const getShortUrlVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getShortUrlVisits: getShortUrlVisitsCall });

  describe('reducer', () => {
    const buildState = (data: Partial<ShortUrlVisits>) => fromPartial<ShortUrlVisits>(data);

    it('returns loading when idle', () => {
      const { status } = reducer(
        buildState({ status: 'idle' }),
        getShortUrlVisits.pending('', fromPartial({ shortCode: '' })),
      );
      expect(status).toEqual('loading');
    });

    it('returns canceled status when loading is canceled', () => {
      const { status } = reducer(buildState({ status: 'loading' }), cancelGetShortUrlVisits());
      expect(status).toEqual('canceled');
    });

    it('stops loading and returns error when rejected', () => {
      const result = reducer(
        buildState({ status: 'loading' }),
        getShortUrlVisits.rejected(problemDetailsError, '', fromPartial({ shortCode: '' })),
      );

      expect(result).toEqual({ status: 'error', error: problemDetailsError });
    });

    it('return visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const result = reducer(
        buildState({ status: 'loading' }),
        getShortUrlVisits.fulfilled({ visits: actionVisits }, '', fromPartial({ shortCode: '' })),
      );

      expect(result).toEqual({ status: 'loaded', visits: actionVisits });
    });

    it.each([
      [{ shortCode: 'abc123' }, visitsMocks.length + 1],
      [{ shortCode: 'def456' }, visitsMocks.length],
      [
        fromPartial<ShortUrlVisits>({
          shortCode: 'abc123',
          params: {
            dateRange: { endDate: subDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<ShortUrlVisits>({
          shortCode: 'abc123',
          params: {
            dateRange: { startDate: addDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<ShortUrlVisits>({
          shortCode: 'abc123',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: subDays(now, 2),
            },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<ShortUrlVisits>({
          shortCode: 'abc123',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        visitsMocks.length + 1,
      ],
      [
        fromPartial<ShortUrlVisits>({
          shortCode: 'def456',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        visitsMocks.length,
      ],
    ])('prepends new visits when visits are created', (state, expectedVisits) => {
      const shortUrl = { shortCode: 'abc123' };
      const prevState = buildState({ ...state, status: 'loaded', visits: visitsMocks });

      const result = reducer(
        prevState,
        createNewVisits([fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } })]),
      );

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
      const result = reducer(buildState({ status: prevStatus }), getShortUrlVisits.progressChanged(85));
      expect(result).toEqual(expectedResult);
    });

    it('returns fallbackInterval when falling back to another interval', () => {
      const fallbackInterval: DateInterval = 'last30Days';
      const state = reducer(undefined, getShortUrlVisits.fallbackToInterval(fallbackInterval));

      expect(state).toEqual(expect.objectContaining({ fallbackInterval }));
    });

    it.each([
      { shortCode: 'abc123', domain: 'domain', expectedVisitsLength: 0 },
      { shortCode: 'another', domain: undefined, expectedVisitsLength: 2 },
      { shortCode: 'abc123', domain: undefined, expectedVisitsLength: 2 },
    ])('clears visits when visits are deleted for active short URL', ({ shortCode, domain, expectedVisitsLength }) => {
      const prevState = buildState({
        status: 'loaded',
        visits: [fromPartial({}), fromPartial({})],
        shortCode: 'abc123',
        domain: 'domain',
      });
      const result = reducer(
        prevState,
        deleteShortUrlVisitsThunk.fulfilled(fromPartial({ shortCode, domain }), '', fromPartial({})),
      );

      expect(result.status).toEqual('loaded');
      if (result.status === 'loaded') {
        expect(result.visits).toHaveLength(expectedVisitsLength);
      }
    });
  });

  describe('getShortUrlVisits', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({
      shortUrlVisits: { status: 'idle' },
    });

    it.each([
      [undefined],
      ['foobar.com'],
    ])('dispatches start and success when promise is resolved', async (domain) => {
      const shortCode = 'abc123';
      const getVisitsParam = { shortCode, domain, params: {}, options: {}, apiClientFactory };

      getShortUrlVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getShortUrlVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: visitsMocks, ...getVisitsParam },
      }));
      expect(getShortUrlVisitsCall).toHaveBeenCalledOnce();
    });

    it('performs multiple API requests when response contains more pages', async () => {
      const expectedRequests = 3;
      getShortUrlVisitsCall.mockImplementation(async (_, { page }) =>
        Promise.resolve({
          data: visitsMocks,
          pagination: {
            currentPage: page,
            pagesCount: expectedRequests,
            totalItems: 1,
          },
        }));

      await getShortUrlVisits(
        { shortCode: 'abc123', params: {}, options: {}, apiClientFactory },
      )(dispatchMock, getState, {});

      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(expectedRequests);
      expect(dispatchMock).toHaveBeenNthCalledWith(3, expect.objectContaining({
        payload: expect.objectContaining({
          visits: [...visitsMocks, ...visitsMocks, ...visitsMocks],
        }),
      }));
    });

    it.each([
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 5)) })],
        getShortUrlVisits.fallbackToInterval('last7Days'),
        3,
      ],
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 200)) })],
        getShortUrlVisits.fallbackToInterval('last365Days'),
        3,
      ],
      [[], expect.objectContaining({ type: getShortUrlVisits.fulfilled.toString() }), 2],
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
      getShortUrlVisitsCall
        .mockResolvedValueOnce(buildVisitsResult())
        .mockResolvedValueOnce(buildVisitsResult(lastVisits));

      await getShortUrlVisits(
        { shortCode: 'abc123', params: {}, options: { doIntervalFallback: true }, apiClientFactory },
      )(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(2);
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
      // Start date only and loadPrevInterval: true -> prev visits are loaded
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
      const shortCode = 'abc123';
      const getVisitsParam: WithApiClient<LoadShortUrlVisits> = {
        shortCode,
        params: { dateRange },
        options: { loadPrevInterval },
        apiClientFactory,
      };
      const prevVisits = expectsPrevVisits ? visitsMocks.map(
        (visit, index) => ({ ...visit, date: dateForVisit(index + 1 + visitsMocks.length) }),
      ) : undefined;

      getShortUrlVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getShortUrlVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: visitsMocks, prevVisits, ...getVisitsParam },
      }));
      expect(getShortUrlVisitsCall).toHaveBeenCalledTimes(expectsPrevVisits ? 2 : 1);
    });
  });
});
