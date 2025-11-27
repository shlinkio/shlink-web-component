import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { setShortUrlRedirectRules, setShortUrlRedirectRulesReducerCreator } from '../reducers/setShortUrlRedirectRules';
import { ShortUrlRedirectRules } from '../ShortUrlRedirectRules';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('ShortUrlRedirectRules', () => ShortUrlRedirectRules);
  bottle.decorator('ShortUrlRedirectRules', connect(
    ['shortUrlsDetails', 'shortUrlRedirectRulesSaving'],
    ['getShortUrlsDetails', 'setShortUrlRedirectRules', 'resetSetRules'],
  ));

  // Actions
  bottle.serviceFactory('setShortUrlRedirectRules', setShortUrlRedirectRules, 'apiClientFactory');
  bottle.serviceFactory('resetSetRules', (obj) => obj.resetSetRules, 'setShortUrlRedirectRulesReducerCreator');

  // Reducers
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
