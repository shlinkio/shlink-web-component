import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import {
  deleteShortUrlVisits as deleteShortUrlVisitsCreator,
  shortUrlVisitsDeletionReducerCreator,
} from '../../../src/visits/reducers/shortUrlVisitsDeletion';

describe('shortUrlsVisitsDeletionReducer', () => {
  const deleteShortUrlVisitsCall = vi.fn();
  const buildShlinkApiClientMock = () => fromPartial<ShlinkApiClient>({
    deleteShortUrlVisits: deleteShortUrlVisitsCall,
  });
  const deleteShortUrlVisits = deleteShortUrlVisitsCreator(buildShlinkApiClientMock);
  const { reducer } = shortUrlVisitsDeletionReducerCreator(deleteShortUrlVisits);

  describe('reducer', () => {
    it('returns deleting for pending action', () => {
      const result = reducer(fromPartial({}), deleteShortUrlVisits.pending('', fromPartial({})));
      expect(result).toEqual(expect.objectContaining({ deleting: true, error: false }));
    });

    it('returns error for rejected action', () => {
      const error = { type: 'NOT_FOUND', status: 404 } as unknown as Error;
      const result = reducer(fromPartial({}), deleteShortUrlVisits.rejected(error, '', fromPartial({})));

      expect(result).toEqual(expect.objectContaining({ deleting: false, error: true }));
    });

    it('returns success on fulfilled rejected', () => {
      const shortUrl = { shortCode: 'shortCode', domain: 'domain', deletedVisits: 10 };
      const result = reducer(fromPartial({}), deleteShortUrlVisits.fulfilled(shortUrl, '', fromPartial({})));

      expect(result).toEqual(expect.objectContaining({ deleting: false, error: false, ...shortUrl }));
    });
  });

  describe('deleteShortUrlVisits', () => {
    const dispatch = vi.fn();
    it('dispatches payload containing short URL info and deleted visits', async () => {
      deleteShortUrlVisitsCall.mockResolvedValue({ deletedVisits: 50 });

      await deleteShortUrlVisits({ shortCode: 'foo' })(dispatch, vi.fn(), {});

      expect(deleteShortUrlVisitsCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { shortCode: 'foo', deletedVisits: 50 },
      }));
    });
  });
});
