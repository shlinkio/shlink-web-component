import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkVisit, ShlinkVisitsList } from '../../../src/api-contract';
import type { RootState } from '../../../src/container/store';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import type { LoadTagVisits, TagVisits } from '../../../src/visits/reducers/tagVisits';
import {
  getTagVisits as getTagVisitsCreator,
  tagVisitsReducerCreator,
} from '../../../src/visits/reducers/tagVisits';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('tagVisitsReducer', () => {
  const now = new Date();
  const dateForVisit = (day: number) => `2020-01-1${day}T00:00:00Z`;
  const visitsMocks = rangeOf(2, (index) => fromPartial<ShlinkVisit>({ date: dateForVisit(index) }));
  const getTagVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getTagVisits: getTagVisitsCall });
  const getTagVisits = getTagVisitsCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetTagVisits } = tagVisitsReducerCreator(getTagVisits);

  describe('reducer', () => {
    const buildState = (data: Partial<TagVisits>) => fromPartial<TagVisits>(data);

    it('returns loading when pending', () => {
      const { loading } = reducer(
        buildState({ loading: false }),
        getTagVisits.pending('', fromPartial({ tag: '' }), undefined),
      );
      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(buildState({ cancelLoad: false }), cancelGetTagVisits());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        buildState({ loading: true, errorData: null }),
        getTagVisits.rejected(problemDetailsError, '', fromPartial({ tag: '' }), undefined, undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const { loading, errorData, visits } = reducer(
        buildState({ loading: true, errorData: null }),
        getTagVisits.fulfilled({ visits: actionVisits }, '', fromPartial({ tag: '' }), undefined),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visits).toEqual(actionVisits);
    });

    it.each([
      [{ tag: 'foo' }, visitsMocks.length + 1],
      [{ tag: 'bar' }, visitsMocks.length],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
          params: {
            dateRange: { endDate: subDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
          params: {
            dateRange: { startDate: addDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
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
        fromPartial<TagVisits>({
          tag: 'foo',
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
        fromPartial<TagVisits>({
          tag: 'bar',
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        visitsMocks.length,
      ],
    ])('prepends new visits new visits are created', (state, expectedVisits) => {
      const shortUrl = {
        tags: ['foo', 'baz'],
      };
      const prevState = buildState({
        ...state,
        visits: visitsMocks,
      });

      const { visits } = reducer(
        prevState,
        createNewVisits([fromPartial({ shortUrl, visit: { date: formatIsoDate(now) ?? undefined } })]),
      );

      expect(visits).toHaveLength(expectedVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getTagVisits.progressChanged(85));
      expect(progress).toEqual(85);
    });

    it('returns fallbackInterval when falling back to another interval', () => {
      const fallbackInterval: DateInterval = 'last30Days';
      const state = reducer(undefined, getTagVisits.fallbackToInterval(fallbackInterval));

      expect(state).toEqual(expect.objectContaining({ fallbackInterval }));
    });
  });

  describe('getTagVisits', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({
      tagVisits: { cancelLoad: false },
    });
    const tag = 'foo';

    it('dispatches start and success when promise is resolved', async () => {
      const visits = visitsMocks;
      const getVisitsParam = { tag, params: {}, options: {} };

      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits, ...getVisitsParam },
      }));
      expect(getTagVisitsCall).toHaveBeenCalledOnce();
    });

    it.each([
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 20)) })],
        getTagVisits.fallbackToInterval('last30Days'),
        3,
      ],
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 100)) })],
        getTagVisits.fallbackToInterval('last180Days'),
        3,
      ],
      [[], expect.objectContaining({ type: getTagVisits.fulfilled.toString() }), 2],
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
      getTagVisitsCall
        .mockResolvedValueOnce(buildVisitsResult())
        .mockResolvedValueOnce(buildVisitsResult(lastVisits));

      await getTagVisits({ tag, params: {}, options: { doIntervalFallback: true } })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getTagVisitsCall).toHaveBeenCalledTimes(2);
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
      const getVisitsParam: LoadTagVisits = {
        tag,
        params: { dateRange },
        options: { loadPrevInterval },
      };
      const prevVisits = expectsPrevVisits ? visitsMocks.map(
        (visit, index) => ({ ...visit, date: dateForVisit(index + 1 + visitsMocks.length) }),
      ) : undefined;

      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: visitsMocks, prevVisits, ...getVisitsParam },
      }));
      expect(getTagVisitsCall).toHaveBeenCalledTimes(expectsPrevVisits ? 2 : 1);
    });
  });
});
