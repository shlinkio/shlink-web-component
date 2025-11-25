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
        shortCode: '',
        loading: true,
        error: false,
        deleted: false,
      }));

    it('returns default on RESET_DELETE_SHORT_URL', () =>
      expect(reducer(undefined, resetDeleteShortUrl())).toEqual({
        shortCode: '',
        loading: false,
        error: false,
        deleted: false,
      }));

    it('returns shortCode on SHORT_URL_DELETED', () =>
      expect(reducer(undefined, deleteShortUrl.fulfilled({ shortCode: 'foo' }, '', {
        shortCode: 'foo',
        apiClientFactory,
      }))).toEqual({
        shortCode: 'foo',
        loading: false,
        error: false,
        deleted: true,
      }));

    it('returns errorData on DELETE_SHORT_URL_ERROR', () => {
      const errorData = problemDetailsError;

      expect(reducer(undefined, deleteShortUrl.rejected(errorData, '', { shortCode: '', apiClientFactory }))).toEqual({
        shortCode: '',
        loading: false,
        error: true,
        deleted: false,
        errorData,
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
