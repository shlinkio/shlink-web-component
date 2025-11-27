import { ErrorType, type ShlinkRedirectRule } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import { parseApiError } from '../../../src/api-contract/utils';
import {
  getShortUrlRedirectRules as getShortUrlRedirectRulesCreator,
  shortUrlRedirectRulesReducerCreator,
} from '../../../src/redirect-rules/reducers/shortUrlRedirectRules';

describe('shortUrlRedirectRulesReducer', () => {
  const getShortUrlRedirectRulesCall = vi.fn();
  const buildShlinkApiClient = () => fromPartial<ShlinkApiClient>({
    getShortUrlRedirectRules: getShortUrlRedirectRulesCall,
  });
  const getShortUrlRedirectRules = getShortUrlRedirectRulesCreator(buildShlinkApiClient);
  const { reducer } = shortUrlRedirectRulesReducerCreator(getShortUrlRedirectRules);

  describe('reducer', () => {
    it('returns loading on pending', () => {
      const result = reducer(undefined, getShortUrlRedirectRules.pending('', fromPartial({}), undefined));
      expect(result).toEqual({ status: 'loading' });
    });

    it('returns error data on rejected', () => {
      const error = { type: ErrorType.INVALID_SHORTCODE, status: 404 } as unknown as Error;
      const result = reducer(
        undefined,
        getShortUrlRedirectRules.rejected(error, '', fromPartial({}), undefined, undefined),
      );
      expect(result).toEqual({ status: 'error', error: parseApiError(error) });
    });

    it('returns result on fulfilled', () => {
      const result = reducer(
        undefined,
        getShortUrlRedirectRules.fulfilled(fromPartial({}), '', fromPartial({}), undefined),
      );
      expect(result).toEqual(expect.objectContaining({ status: 'loaded' }));
    });
  });

  describe('getShortUrlRedirectRules', () => {
    const dispatch = vi.fn();

    it('calls API on success', async () => {
      const shortUrlRules: ShlinkRedirectRule[] = [
        {
          longUrl: 'https://example.com',
          priority: 1,
          conditions: [],
        },
      ];

      getShortUrlRedirectRulesCall.mockResolvedValue(shortUrlRules);
      await getShortUrlRedirectRules({ shortCode: '' })(dispatch, vi.fn(), {});

      expect(getShortUrlRedirectRulesCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: shortUrlRules }));
    });
  });
});
