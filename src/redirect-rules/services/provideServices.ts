import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { setShortUrlRedirectRules, setShortUrlRedirectRulesReducerCreator } from '../reducers/setShortUrlRedirectRules';
import {
  getShortUrlRedirectRules,
  shortUrlRedirectRulesReducerCreator,
} from '../reducers/shortUrlRedirectRules';
import { ShortUrlRedirectRules } from '../ShortUrlRedirectRules';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('ShortUrlRedirectRules', () => ShortUrlRedirectRules);
  bottle.decorator('ShortUrlRedirectRules', connect(
    ['shortUrlRedirectRules', 'shortUrlsDetails', 'shortUrlRedirectRulesSaving'],
    ['getShortUrlRedirectRules', 'getShortUrlsDetails', 'setShortUrlRedirectRules'],
  ));

  // Actions
  bottle.serviceFactory('getShortUrlRedirectRules', getShortUrlRedirectRules, 'apiClientFactory');
  bottle.serviceFactory('setShortUrlRedirectRules', setShortUrlRedirectRules, 'apiClientFactory');

  // Reducers
  bottle.serviceFactory(
    'shortUrlRedirectRulesReducerCreator',
    shortUrlRedirectRulesReducerCreator,
    'getShortUrlRedirectRules',
  );
  bottle.serviceFactory('shortUrlRedirectRulesReducer', (obj) => obj.reducer, 'shortUrlRedirectRulesReducerCreator');

  bottle.serviceFactory(
    'setShortUrlRedirectRulesReducerCreator',
    setShortUrlRedirectRulesReducerCreator,
    'setShortUrlRedirectRules',
  );
  bottle.serviceFactory(
    'setShortUrlRedirectRulesReducer',
    (obj) => obj.reducer,
    'setShortUrlRedirectRulesReducerCreator',
  );
};
