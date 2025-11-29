import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import {
  deleteShortUrlVisitsThunk as deleteShortUrlVisits,
  shortUrlVisitsDeletionReducer as reducer,
} from '../../../src/visits/reducers/shortUrlVisitsDeletion';

describe('shortUrlsVisitsDeletionReducer', () => {
  const deleteShortUrlVisitsCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ deleteShortUrlVisits: deleteShortUrlVisitsCall });

  describe('reducer', () => {
    it('returns deleting for pending action', () => {
      const result = reducer(fromPartial({}), deleteShortUrlVisits.pending('', fromPartial({})));
      expect(result).toEqual(expect.objectContaining({ status: 'deleting' }));
    });

    it('returns error for rejected action', () => {
      const error = { type: 'NOT_FOUND', status: 404 } as unknown as Error;
      const result = reducer(fromPartial({}), deleteShortUrlVisits.rejected(error, '', fromPartial({})));

      expect(result).toEqual(expect.objectContaining({ status: 'error' }));
    });

    it('returns success on fulfilled rejected', () => {
      const shortUrl = { shortCode: 'shortCode', domain: 'domain', deletedVisits: 10 };
      const result = reducer(fromPartial({}), deleteShortUrlVisits.fulfilled(shortUrl, '', fromPartial({})));

      expect(result).toEqual(expect.objectContaining({ status: 'deleted', ...shortUrl }));
    });
  });

  describe('deleteShortUrlVisits', () => {
    const dispatch = vi.fn();
    it('dispatches payload containing short URL info and deleted visits', async () => {
      deleteShortUrlVisitsCall.mockResolvedValue({ deletedVisits: 50 });

      await deleteShortUrlVisits({ shortCode: 'foo', apiClientFactory })(dispatch, vi.fn(), {});

      expect(deleteShortUrlVisitsCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { shortCode: 'foo', deletedVisits: 50 },
      }));
    });
  });
});
