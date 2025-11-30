import type { ShlinkRedirectRule } from '@shlinkio/shlink-js-sdk/api-contract';
import { ErrorType } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import { parseApiError } from '../../../src/api-contract/utils';
import {
  resetSetRules,
  setShortUrlRedirectRulesThunk as setShortUrlRedirectRules,
  shortUrlRedirectRulesSavingReducer as reducer,
} from '../../../src/redirect-rules/reducers/setShortUrlRedirectRules';

describe('setShortUrlRedirectRulesReducer', () => {
  const setShortUrlRedirectRulesCall = vi.fn();
  const apiClientFactory = () => fromPartial<ShlinkApiClient>({
    setShortUrlRedirectRules: setShortUrlRedirectRulesCall,
  });

  describe('reducer', () => {
    it('returns saving on pending', () => {
      const result = reducer(undefined, setShortUrlRedirectRules.pending('', fromPartial({})));
      expect(result).toEqual({ status: 'saving' });
    });

    it('returns error data on rejected', () => {
      const error = { type: ErrorType.INVALID_SHORTCODE, status: 404 } as unknown as Error;
      const result = reducer(
        undefined,
        setShortUrlRedirectRules.rejected(error, '', fromPartial({})),
      );
      expect(result).toEqual({ status: 'error', error: parseApiError(error) });
    });

    it('returns saved on fulfilled', () => {
      const result = reducer(
        undefined,
        setShortUrlRedirectRules.fulfilled(fromPartial({}), '', fromPartial({})),
      );
      expect(result).toEqual({ status: 'saved' });
    });

    it('resets to initial state on resetSetRules', () => {
      const result = reducer(undefined, resetSetRules());
      expect(result).toEqual({ status: 'idle' });
    });
  });

  describe('setShortUrlRedirectRules', () => {
    const dispatch = vi.fn();

    it('calls API on success', async () => {
      const shortUrlRules: ShlinkRedirectRule[] = [
        {
          longUrl: 'https://example.com',
          priority: 1,
          conditions: [],
        },
      ];

      setShortUrlRedirectRulesCall.mockResolvedValue(shortUrlRules);
      await setShortUrlRedirectRules(
        { shortUrl: fromPartial({}), data: fromPartial({}), apiClientFactory },
      )(dispatch, vi.fn(), {});

      expect(setShortUrlRedirectRulesCall).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: shortUrlRules }));
    });
  });
});
