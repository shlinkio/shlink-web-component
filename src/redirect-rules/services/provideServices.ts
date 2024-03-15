import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import {
  getShortUrlRedirectRules,
  shortUrlRedirectRulesReducerCreator,
} from '../reducers/shortUrlRedirectRules';
import { ShortUrlRedirectRules } from '../ShortUrlRedirectRules';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('ShortUrlRedirectRules', () => ShortUrlRedirectRules);
  bottle.decorator('ShortUrlRedirectRules', connect(
    ['shortUrlRedirectRules', 'shortUrlsDetails'],
    ['getShortUrlRedirectRules', 'getShortUrlsDetails'],
  ));

  // Actions
  bottle.serviceFactory('getShortUrlRedirectRules', getShortUrlRedirectRules, 'apiClientFactory');

  // Reducers
  bottle.serviceFactory(
    'shortUrlRedirectRulesReducerCreator',
    shortUrlRedirectRulesReducerCreator,
    'getShortUrlRedirectRules',
    // TODO Add setShortUrlRedirectRules reducer
  );
  bottle.serviceFactory('shortUrlRedirectRulesReducer', (obj) => obj.reducer, 'shortUrlRedirectRulesReducerCreator');
};
