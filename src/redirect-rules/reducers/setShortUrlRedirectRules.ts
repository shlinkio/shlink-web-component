import type { ShlinkSetRedirectRulesData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { ShlinkApiClient } from '../../api-contract';
import type { ShortUrlIdentifier } from '../../short-urls/data';
import { createAsyncThunk } from '../../utils/redux';

const REDUCER_PREFIX = 'shlink/setShortUrlRedirectRules';

export type SetShortUrlRedirectRules = {
  shortUrl: ShortUrlIdentifier;
  data: ShlinkSetRedirectRulesData;
};

export const setShortUrlRedirectRules = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/setShortUrlRedirectRules`,
  ({ shortUrl, data }: SetShortUrlRedirectRules) => {
    const { shortCode, domain } = shortUrl;
    return apiClientFactory().setShortUrlRedirectRules(shortCode, domain, data);
  },
);

// TODO Create reducer
