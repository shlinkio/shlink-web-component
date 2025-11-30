import type { ShlinkVisitsSummary } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkOrphanVisit, ShlinkVisitsOverview } from '../../../src/api-contract';
import type { RootState } from '../../../src/store';
import { createNewVisits } from '../../../src/visits/reducers/visitCreation';
import type { VisitsOverview } from '../../../src/visits/reducers/visitsOverview';
import {
  loadVisitsOverviewThunk as loadVisitsOverview,
  visitsOverviewReducer as reducer,
} from '../../../src/visits/reducers/visitsOverview';

describe('visitsOverviewReducer', () => {
  const getVisitsOverview = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ getVisitsOverview });

  describe('reducer', () => {
    const state = (payload: Partial<VisitsOverview> = {}) => fromPartial<VisitsOverview>(payload);

    it('returns loading on GET_OVERVIEW_START', () => {
      const { status } = reducer(state({ status: 'idle' }), loadVisitsOverview.pending('', fromPartial({})));

      expect(status).toEqual('loading');
    });

    it('stops loading and returns error on GET_OVERVIEW_ERROR', () => {
      const { status } = reducer(state({ status: 'loading' }), loadVisitsOverview.rejected(null, '', fromPartial({})));

      expect(status).toEqual('error');
    });

    it('return visits overview on GET_OVERVIEW', () => {
      const action = loadVisitsOverview.fulfilled(fromPartial({
        nonOrphanVisits: { total: 100 },
      }), 'requestId', fromPartial({}));
      const result = reducer(state({ status: 'loading' }), action);

      expect(result).toEqual(expect.objectContaining({
        status: 'loaded',
        nonOrphanVisits: expect.objectContaining({ total: 100 }),
      }));
    });

    it.each([
      [50, 53],
      [0, 3],
    ])('returns updated amounts on CREATE_VISITS', (providedOrphanVisitsCount, expectedOrphanVisitsCount) => {
      const result = reducer(
        state({
          status: 'loaded',
          nonOrphanVisits: fromPartial({ total: 100 }),
          orphanVisits: fromPartial({ total: providedOrphanVisitsCount }),
        }),
        createNewVisits([
          fromPartial({ visit: {} }),
          fromPartial({ visit: {} }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url' }) }),
        ]),
      );

      expect(result).toEqual(expect.objectContaining({
        nonOrphanVisits: expect.objectContaining({ total: 102 }),
        orphanVisits: expect.objectContaining({ total: expectedOrphanVisitsCount }),
      }));
    });

    it.each([
      [
        {} satisfies Partial<ShlinkVisitsSummary>,
        {} satisfies Partial<ShlinkVisitsSummary>,
        { total: 103 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 203 } satisfies Partial<ShlinkVisitsSummary>,
      ],
      [
        { bots: 35 } satisfies Partial<ShlinkVisitsSummary>,
        { bots: 35 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 103, bots: 37 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 203, bots: 36 } satisfies Partial<ShlinkVisitsSummary>,
      ],
      [
        { nonBots: 41, bots: 85 } satisfies Partial<ShlinkVisitsSummary>,
        { nonBots: 63, bots: 27 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 103, nonBots: 42, bots: 87 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 203, nonBots: 65, bots: 28 } satisfies Partial<ShlinkVisitsSummary>,
      ],
      [
        { nonBots: 56 } satisfies Partial<ShlinkVisitsSummary>,
        { nonBots: 99 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 103, nonBots: 57 } satisfies Partial<ShlinkVisitsSummary>,
        { total: 203, nonBots: 101 } satisfies Partial<ShlinkVisitsSummary>,
      ],
    ])('takes bots and non-bots into consideration when creating visits', (
      initialNonOrphanVisits,
      initialOrphanVisits,
      expectedNonOrphanVisits,
      expectedOrphanVisits,
    ) => {
      const result = reducer(
        state({
          status: 'loaded',
          nonOrphanVisits: { total: 100, bots: 0, nonBots: 0, ...initialNonOrphanVisits },
          orphanVisits: { total: 200, bots: 0, nonBots: 0, ...initialOrphanVisits },
        }),
        createNewVisits([
          fromPartial({ visit: {} }),
          fromPartial({ visit: { potentialBot: true } }),
          fromPartial({ visit: { potentialBot: true } }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url' }) }),
          fromPartial({ visit: fromPartial<ShlinkOrphanVisit>({ type: 'base_url', potentialBot: true }) }),
        ]),
      );

      expect(result).toEqual(expect.objectContaining({
        nonOrphanVisits: expect.objectContaining(expectedNonOrphanVisits),
        orphanVisits: expect.objectContaining(expectedOrphanVisits),
      }));
    });
  });

  describe('loadVisitsOverview', () => {
    const dispatchMock = vi.fn();
    const getState = () => fromPartial<RootState>({});

    it('dispatches start and success when promise is resolved', async () => {
      const serverResult: ShlinkVisitsOverview = {
        nonOrphanVisits: { total: 50, nonBots: 20, bots: 30 },
        orphanVisits: { total: 50, nonBots: 20, bots: 30 },
      };
      const dispatchedPayload = {
        nonOrphanVisits: { total: 50, nonBots: 20, bots: 30 },
        orphanVisits: { total: 50, nonBots: 20, bots: 30 },
      };

      const resolvedOverview = fromPartial<ShlinkVisitsOverview>(serverResult);
      getVisitsOverview.mockResolvedValue(resolvedOverview);

      await loadVisitsOverview({ apiClientFactory })(dispatchMock, getState, {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ payload: dispatchedPayload }));
      expect(getVisitsOverview).toHaveBeenCalledOnce();
    });
  });
});
