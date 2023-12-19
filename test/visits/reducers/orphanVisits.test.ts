import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkVisit, ShlinkVisits } from '../../../src/api-contract';
import type { RootState } from '../../../src/container/store';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import {
  getOrphanVisits as getOrphanVisitsCreator,
  orphanVisitsReducerCreator,
} from '../../../src/visits/reducers/orphanVisits';
import type { VisitsInfo } from '../../../src/visits/reducers/types';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('orphanVisitsReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getOrphanVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getOrphanVisits: getOrphanVisitsCall });
  const getOrphanVisits = getOrphanVisitsCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetOrphanVisits } = orphanVisitsReducerCreator(
    getOrphanVisits,
    fromPartial({ fulfilled: { type: 'deleteOrphanVisits' } }),
  );

  describe('reducer', () => {
    const buildState = (data: Partial<VisitsInfo>) => fromPartial<VisitsInfo>(data);

    it('returns loading when pending', () => {
      const { loading } = reducer(buildState({ loading: false }), getOrphanVisits.pending('', {}));
      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when loading is cancelled', () => {
      const { cancelLoad } = reducer(buildState({ cancelLoad: false }), cancelGetOrphanVisits());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        buildState({ loading: true, errorData: null }),
        getOrphanVisits.rejected(problemDetailsError, '', {}),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('return visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const { loading, errorData, visits } = reducer(
        buildState({ loading: true, errorData: null }),
        getOrphanVisits.fulfilled({ visits: actionVisits }, '', {}),
      );

      expect(loading).toEqual(false);
      expect(errorData).toBeNull();
      expect(visits).toEqual(actionVisits);
    });

    it.each([
      [{}, visitsMocks.length + 2],
      [
        fromPartial<VisitsInfo>({
          query: { endDate: formatIsoDate(subDays(now, 1)) ?? undefined },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<VisitsInfo>({
          query: { startDate: formatIsoDate(addDays(now, 1)) ?? undefined },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<VisitsInfo>({
          query: {
            startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
            endDate: formatIsoDate(subDays(now, 2)) ?? undefined,
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<VisitsInfo>({
          query: {
            startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
            endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
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
      const result = reducer(prevState, { type: 'deleteOrphanVisits', payload: {} });

      expect(result.visits).toHaveLength(0);
    });
  });

  describe('getOrphanVisits', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({
      orphanVisits: { cancelLoad: false },
    });

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visits = visitsMocks.map((visit) => ({ ...visit, visitedUrl: '' }));
      getOrphanVisitsCall.mockResolvedValue({
        data: visits,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getOrphanVisits({ query })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits, query: query ?? {} },
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
      const buildVisitsResult = (data: ShlinkVisit[] = []): ShlinkVisits => ({
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

      await getOrphanVisits({ doIntervalFallback: true })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getOrphanVisitsCall).toHaveBeenCalledTimes(2);
    });
  });
});
