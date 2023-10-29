import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import {
  deleteOrphanVisits as deleteOrphanVisitsCreator,
  orphanVisitsDeletionReducerCreator,
} from '../../../src/visits/reducers/orphanVisitsDeletion';

describe('orphanVisitsDeletionReducer', () => {
  const deleteOrphanVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({
    deleteOrphanVisits: deleteOrphanVisitsCall,
  });
  const deleteOrphanVisits = deleteOrphanVisitsCreator(buildShlinkApiClientMock);
  const { reducer } = orphanVisitsDeletionReducerCreator(deleteOrphanVisits);

  describe('reducer', () => {
    it('returns deleting for pending action', () => {
      const result = reducer(fromPartial({}), deleteOrphanVisits.pending(''));
      expect(result).toEqual(expect.objectContaining({ deleting: true, error: false }));
    });

    it('returns error for rejected action', () => {
      const error = { type: 'INTERNAL_SERVER_ERROR', status: 500 } as unknown as Error;
      const result = reducer(fromPartial({}), deleteOrphanVisits.rejected(error, ''));

      expect(result).toEqual(expect.objectContaining({ deleting: false, error: true }));
    });

    it('returns success on fulfilled rejected', () => {
      const deletionResult = { deletedVisits: 10 };
      const result = reducer(fromPartial({}), deleteOrphanVisits.fulfilled(deletionResult, ''));

      expect(result).toEqual(expect.objectContaining({ deleting: false, error: false, ...deletionResult }));
    });
  });

  describe('deleteOrphanVisits', () => {
    const dispatch = vi.fn();
    it('dispatches payload containing deleted visits', async () => {
      deleteOrphanVisitsCall.mockResolvedValue({ deletedVisits: 50 });

      await deleteOrphanVisits()(dispatch, vi.fn(), {});

      expect(deleteOrphanVisitsCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { deletedVisits: 50 },
      }));
    });
  });
});
