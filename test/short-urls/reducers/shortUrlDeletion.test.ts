import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import {
  deleteShortUrlThunk as deleteShortUrl,
  resetDeleteShortUrl,
  shortUrlDeletionReducer as reducer,
} from '../../../src/short-urls/reducers/shortUrlDeletion';
import { problemDetailsError } from '../../__mocks__/ProblemDetailsError.mock';

describe('shortUrlDeletionReducer', () => {
  const deleteShortUrlCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ deleteShortUrl: deleteShortUrlCall });

  describe('reducer', () => {
    it('returns loading on DELETE_SHORT_URL_START', () =>
      expect(reducer(undefined, deleteShortUrl.pending('', { shortCode: '', apiClientFactory }))).toEqual({
        status: 'deleting',
      }));

    it('returns default on RESET_DELETE_SHORT_URL', () => {
      expect(reducer(undefined, resetDeleteShortUrl())).toEqual({ status: 'idle' });
    });

    it('returns shortCode on SHORT_URL_DELETED', () =>
      expect(reducer(undefined, deleteShortUrl.fulfilled({ shortCode: 'foo' }, '', {
        shortCode: 'foo',
        apiClientFactory,
      }))).toEqual({ shortCode: 'foo', status: 'deleted' }));

    it('returns errorData on DELETE_SHORT_URL_ERROR', () => {
      const error = problemDetailsError;

      expect(reducer(undefined, deleteShortUrl.rejected(error, '', { shortCode: '', apiClientFactory }))).toEqual({
        status: 'error',
        error,
      });
    });
  });

  describe('deleteShortUrl', () => {
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue({ selectedServer: {} });

    it.each(
      [[undefined], [null], ['example.com']],
    )('dispatches proper actions if API client request succeeds', async (domain) => {
      const shortCode = 'abc123';

      await deleteShortUrl({ shortCode, domain, apiClientFactory })(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { shortCode, domain },
      }));

      expect(deleteShortUrlCall).toHaveBeenCalledOnce();
      expect(deleteShortUrlCall).toHaveBeenCalledWith({ shortCode, domain });
    });
  });
});
