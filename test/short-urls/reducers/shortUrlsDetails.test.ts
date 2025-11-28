import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../../src/api-contract';
import { shortUrlsDetailsReducerCreator } from '../../../src/short-urls/reducers/shortUrlsDetails';
import type { ShortUrlsList } from '../../../src/short-urls/reducers/shortUrlsList';
import type { RootState } from '../../../src/store';

describe('shortUrlsDetailsReducer', () => {
  const getShortUrlCall = vi.fn();
  const buildShlinkApiClient = () => fromPartial<ShlinkApiClient>({ getShortUrl: getShortUrlCall });
  const { reducer, getShortUrlsDetails } = shortUrlsDetailsReducerCreator(buildShlinkApiClient);

  describe('reducer', () => {
    it('returns loading on pending', () => {
      const { status } = reducer({ status: 'idle' }, getShortUrlsDetails.pending('', [], undefined));
      expect(status).toEqual('loading');
    });

    it('stops loading and returns error on rejected', () => {
      const { status } = reducer(
        { status: 'loading' },
        getShortUrlsDetails.rejected(null, '', [], undefined, undefined),
      );

      expect(status).toEqual('error');
    });

    it('return short URLs on fulfilled', () => {
      const identifier = { shortCode: 'abc123' };
      const actionShortUrls = new Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>([
        [identifier, fromPartial<ShlinkShortUrl>({ longUrl: 'foo', shortCode: 'bar' })],
      ]);
      const state = reducer(
        { status: 'loading' },
        getShortUrlsDetails.fulfilled(actionShortUrls, '', [identifier], undefined),
      );
      const { status } = state;

      expect(status).toEqual('loaded');
      // Just making TS happy here
      if (status === 'loaded') {
        expect(state.shortUrls).toEqual(actionShortUrls);
      }
    });
  });

  describe('getShortUrlsDetails', () => {
    const dispatchMock = vi.fn();
    const buildGetState = (shortUrlsList?: ShortUrlsList) => () => fromPartial<RootState>({ shortUrlsList });

    it.each([
      [fromPartial<ShortUrlsList>({ status: 'loading' })],
      [
        fromPartial<ShortUrlsList>({
          status: 'loaded',
          shortUrls: { data: [] },
        }),
      ],
      [
        fromPartial<ShortUrlsList>({
          status: 'loaded',
          shortUrls: {
            data: [{ shortCode: 'this_will_not_match' }],
          },
        }),
      ],
    ])('performs API call when short URL is not found in local state', async (shortUrlsList: ShortUrlsList) => {
      const identifier = { shortCode: 'abc123', domain: '' };
      const resolvedShortUrl = fromPartial<ShlinkShortUrl>({ longUrl: 'foo', shortCode: 'abc123' });
      getShortUrlCall.mockResolvedValue(resolvedShortUrl);

      await getShortUrlsDetails([identifier])(dispatchMock, buildGetState(shortUrlsList), {});

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: new Map([[identifier, resolvedShortUrl]]),
      }));
      expect(getShortUrlCall).toHaveBeenCalledOnce();
    });

    it('avoids API calls when short URL is found in local state', async () => {
      const foundShortUrl = fromPartial<ShlinkShortUrl>({ longUrl: 'foo', shortCode: 'abc123' });

      await getShortUrlsDetails([foundShortUrl])(
        dispatchMock,
        buildGetState(fromPartial({
          status: 'loaded',
          shortUrls: {
            data: [foundShortUrl],
          },
        })),
        {},
      );

      expect(dispatchMock).toHaveBeenCalledTimes(2);
      expect(dispatchMock).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: new Map([[foundShortUrl, foundShortUrl]]),
      }));
      expect(getShortUrlCall).not.toHaveBeenCalled();
    });
  });
});
