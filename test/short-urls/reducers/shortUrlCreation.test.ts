import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkShortUrl } from '../../../src/api-contract';
import {
  createShortUrlThunk as createShortUrl,
  resetCreateShortUrl,
  shortUrlCreationReducer as reducer,
} from '../../../src/short-urls/reducers/shortUrlCreation';

describe('shortUrlCreationReducer', () => {
  const shortUrl = fromPartial<ShlinkShortUrl>({});
  const createShortUrlCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({ createShortUrl: createShortUrlCall });

  describe('reducer', () => {
    it('returns loading on CREATE_SHORT_URL_START', () => {
      expect(reducer(undefined, createShortUrl.pending('', fromPartial({})))).toEqual({ status: 'saving' });
    });

    it('returns error on CREATE_SHORT_URL_ERROR', () => {
      expect(reducer(undefined, createShortUrl.rejected(null, '', fromPartial({})))).toEqual({ status: 'error' });
    });

    it('returns result on CREATE_SHORT_URL', () => {
      expect(reducer(undefined, createShortUrl.fulfilled(shortUrl, '', fromPartial({})))).toEqual({
        result: shortUrl,
        status: 'saved',
      });
    });

    it('returns default state on RESET_CREATE_SHORT_URL', () => {
      expect(reducer(undefined, resetCreateShortUrl())).toEqual({ status: 'idle' });
    });
  });

  describe('createShortUrl', () => {
    const dispatch = vi.fn();

    it('calls API on success', async () => {
      createShortUrlCall.mockResolvedValue(shortUrl);
      await createShortUrl({ longUrl: 'foo', apiClientFactory })(dispatch, vi.fn(), {});

      expect(createShortUrlCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: shortUrl }));
    });
  });
});
