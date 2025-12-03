import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkVisit, ShlinkVisitsList } from '../../../src/api-contract';
import type { RootState } from '../../../src/store';
import type { WithApiClient } from '../../../src/store/helpers';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import type { LoadOrphanVisits } from '../../../src/visits/reducers/orphanVisits';
import {
  cancelGetOrphanVisits,
  getOrphanVisitsThunk as getOrphanVisits,
  orphanVisitsReducer as reducer,
} from '../../../src/visits/reducers/orphanVisits';
import { deleteOrphanVisitsThunk } from '../../../src/visits/reducers/orphanVisitsDeletion';
import type { VisitsInfo } from '../../../src/visits/reducers/types';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('orphanVisitsReducer', () => {
  const now = new Date();
  const dateForVisit = (day: number) => `2020-01-1${day}T00:00:00Z`;
  const visitsMocks = rangeOf(2, (index) => fromPartial<ShlinkVisit>({ date: dateForVisit(index), type: 'base_url' }));
  const getOrphanVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getOrphanVisits: getOrphanVisitsCall });

  describe('reducer', () => {
    const buildState = (data: Partial<VisitsInfo>) => fromPartial<VisitsInfo>(data);

    it('returns loading when pending', () => {
      const { loading } = reducer(
        buildState({ loading: false }),
        getOrphanVisits.pending('', fromPartial({})),
      );
      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when loading is cancelled', () => {
      const { cancelLoad } = reducer(buildState({ cancelLoad: false }), cancelGetOrphanVisits());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        buildState({ loading: true, errorData: null }),
        getOrphanVisits.rejected(problemDetailsError, '', fromPartial({})),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('return visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const { loading, errorData, visits } = reducer(
        buildState({ loading: true, errorData: null }),
        getOrphanVisits.fulfilled({ visits: actionVisits }, '', fromPartial({})),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visits).toEqual(actionVisits);
    });

    it.each([
      [{}, visitsMocks.length + 2],
      [
        fromPartial<VisitsInfo>({
          params: {
            dateRange: { endDate: subDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<VisitsInfo>({
          params: {
            dateRange: { startDate: addDays(now, 1) },
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<VisitsInfo>({
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
        fromPartial<VisitsInfo>({
          params: {
            dateRange: {
              startDate: subDays(now, 5),
              endDate: addDays(now, 3),
            },
          },
        }),
        visitsMocks.length + 2,
      ],
    ])('prepends new visits when visits are created', (state, expectedVisits) => {
      const prevState = buildState({ ...state, visits: visitsMocks });
      const visit = fromPartial<ShlinkVisit>({ date: formatIsoDate(now) ?? undefined });

      const { visits } = reducer(prevState, createNewVisits([{ visit }, { visit }]));

      expect(visits).toHaveLength(expectedVisits);
    });

    it('returns new progress when progress changes', () => {
      const { progress } = reducer(undefined, getOrphanVisits.progressChanged(85));
      expect(progress).toEqual(85);
    });

    it('returns fallbackInterval when falling back to another interval', () => {
      const fallbackInterval: DateInterval = 'last30Days';
      const state = reducer(undefined, getOrphanVisits.fallbackToInterval(fallbackInterval));

      expect(state).toEqual(expect.objectContaining({ fallbackInterval }));
    });

    it('clears visits when deleted', () => {
      const prevState = buildState({
        visits: [fromPartial({}), fromPartial({})],
      });
      const result = reducer(prevState, deleteOrphanVisitsThunk.fulfilled(fromPartial({}), '', fromPartial({})));

      expect(result.visits).toHaveLength(0);
    });
  });

  describe('getOrphanVisits', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({
      orphanVisits: { cancelLoad: false },
    });

    it('dispatches start and success when promise is resolved', async () => {
      const getVisitsParam = { params: {}, options: {}, apiClientFactory };

      getOrphanVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getOrphanVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: visitsMocks, ...getVisitsParam },
      }));
      expect(getOrphanVisitsCall).toHaveBeenCalledOnce();
    });

    it.each([
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 5)) })],
        getOrphanVisits.fallbackToInterval('last7Days'),
        3,
      ],
      [
        [fromPartial<ShlinkVisit>({ date: formatISO(subDays(now, 200)) })],
        getOrphanVisits.fallbackToInterval('last365Days'),
        3,
      ],
      [[], expect.objectContaining({ type: getOrphanVisits.fulfilled.toString() }), 2],
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
      getOrphanVisitsCall
        .mockResolvedValueOnce(buildVisitsResult())
        .mockResolvedValueOnce(buildVisitsResult(lastVisits));

      await getOrphanVisits(
        { params: {}, options: { doIntervalFallback: true }, apiClientFactory },
      )(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getOrphanVisitsCall).toHaveBeenCalledTimes(2);
    });

    it.each([
      // Strict date range and loadPrevInterval: true -> prev visits are loaded
      {
        dateRange: { startDate: subDays(now, 1), endDate: addDays(now, 1) },
        loadPrevInterval: true,
        expectsPrevVisits: true,
        orphanVisitsType: 'base_url' as const,
      },
      // Undefined date range and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: undefined,
        loadPrevInterval: true,
        expectsPrevVisits: false,
        orphanVisitsType: 'regular_404' as const,
      },
      // Empty date range and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: {},
        loadPrevInterval: true,
        expectsPrevVisits: false,
        orphanVisitsType: 'invalid_short_url' as const,
      },
      // Start date only and loadPrevInterval: true -> prev visits are NOT loaded
      {
        dateRange: { startDate: subDays(now, 2) },
        loadPrevInterval: true,
        expectsPrevVisits: true,
        orphanVisitsType: 'invalid_short_url' as const,
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
      { dateRange, loadPrevInterval, expectsPrevVisits, orphanVisitsType },
    ) => {
      const getVisitsParam: WithApiClient<LoadOrphanVisits> = {
        params: { dateRange },
        options: { loadPrevInterval },
        orphanVisitsType,
        apiClientFactory,
      };
      const expectedVisits = visitsMocks.map(
        (visit) => (orphanVisitsType ? { ...visit, type: orphanVisitsType } : visit),
      );
      const prevVisits = expectsPrevVisits ? expectedVisits.map(
        (visit, index) => ({ ...visit, date: dateForVisit(index + 1 + expectedVisits.length) }),
      ) : undefined;

      getOrphanVisitsCall.mockResolvedValue({
        data: expectedVisits,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getOrphanVisits(getVisitsParam)(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits: expectedVisits, prevVisits, ...getVisitsParam },
      }));
      expect(getOrphanVisitsCall).toHaveBeenCalledTimes(expectsPrevVisits ? 2 : 1);
      expect(getOrphanVisitsCall).toHaveBeenCalledWith(expect.objectContaining({ type: orphanVisitsType }));
    });
  });
});
