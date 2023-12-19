import { fromPartial } from '@total-typescript/shoehorn';
import { addDays, formatISO, subDays } from 'date-fns';
import type { ShlinkApiClient, ShlinkVisit, ShlinkVisits } from '../../../src/api-contract';
import type { RootState } from '../../../src/container/store';
import { formatIsoDate } from '../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { rangeOf } from '../../../src/utils/helpers';
import type {
  TagVisits } from '../../../src/visits/reducers/tagVisits';
import {
  getTagVisits as getTagVisitsCreator,
  tagVisitsReducerCreator,
} from '../../../src/visits/reducers/tagVisits';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('tagVisitsReducer', () => {
  const now = new Date();
  const visitsMocks = rangeOf(2, () => fromPartial<ShlinkVisit>({}));
  const getTagVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({ getTagVisits: getTagVisitsCall });
  const getTagVisits = getTagVisitsCreator(buildShlinkApiClientMock);
  const { reducer, cancelGetVisits: cancelGetTagVisits } = tagVisitsReducerCreator(getTagVisits);

  describe('reducer', () => {
    const buildState = (data: Partial<TagVisits>) => fromPartial<TagVisits>(data);

    it('returns loading when pending', () => {
      const { loading } = reducer(buildState({ loading: false }), getTagVisits.pending('', { tag: '' }));
      expect(loading).toEqual(true);
    });

    it('returns cancelLoad when load is cancelled', () => {
      const { cancelLoad } = reducer(buildState({ cancelLoad: false }), cancelGetTagVisits());
      expect(cancelLoad).toEqual(true);
    });

    it('stops loading and returns error when rejected', () => {
      const { loading, errorData } = reducer(
        buildState({ loading: true, errorData: null }),
        getTagVisits.rejected(problemDetailsError, '', { tag: '' }),
      );

      expect(loading).toEqual(false);
      expect(errorData).toEqual(problemDetailsError);
    });

    it('returns visits when fulfilled', () => {
      const actionVisits: ShlinkVisit[] = [fromPartial({}), fromPartial({})];
      const { loading, errorData, visits } = reducer(
        buildState({ loading: true, errorData: null }),
        getTagVisits.fulfilled({ visits: actionVisits }, '', { tag: '' }),
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
          query: { endDate: formatIsoDate(subDays(now, 1)) ?? undefined },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
          query: { startDate: formatIsoDate(addDays(now, 1)) ?? undefined },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
          query: {
            startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
            endDate: formatIsoDate(subDays(now, 2)) ?? undefined,
          },
        }),
        visitsMocks.length,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'foo',
          query: {
            startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
            endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
          },
        }),
        visitsMocks.length + 1,
      ],
      [
        fromPartial<TagVisits>({
          tag: 'bar',
          query: {
            startDate: formatIsoDate(subDays(now, 5)) ?? undefined,
            endDate: formatIsoDate(addDays(now, 3)) ?? undefined,
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

    it.each([
      [undefined],
      [{}],
    ])('dispatches start and success when promise is resolved', async (query) => {
      const visits = visitsMocks;
      getTagVisitsCall.mockResolvedValue({
        data: visitsMocks,
        pagination: {
          currentPage: 1,
          pagesCount: 1,
          totalItems: 1,
        },
      });

      await getTagVisits({ tag, query })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { visits, tag, query: query ?? {} },
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
      const buildVisitsResult = (data: ShlinkVisit[] = []): ShlinkVisits => ({
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

      await getTagVisits({ tag, doIntervalFallback: true })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(expectedDispatchCalls);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expectedSecondDispatch);
      expect(getTagVisitsCall).toHaveBeenCalledTimes(2);
    });
  });
});
