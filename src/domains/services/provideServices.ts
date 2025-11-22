import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { ManageDomains } from '../ManageDomains';
import { domainsListReducerCreator } from '../reducers/domainsList';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  bottle.serviceFactory('ManageDomains', () => ManageDomains);
  bottle.decorator('ManageDomains', connect(['domainsList'], ['filterDomains', 'checkDomainHealth']));

  // Reducer
  bottle.serviceFactory(
    'domainsListReducerCreator',
    domainsListReducerCreator,
    'apiClientFactory',
    'createShortUrl',
  );
  bottle.serviceFactory('domainsListReducer', (obj) => obj.reducer, 'domainsListReducerCreator');

  // Actions
  bottle.serviceFactory('listDomains', (obj) => obj.listDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('filterDomains', (obj) => obj.filterDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('checkDomainHealth', (obj) => obj.checkDomainHealth, 'domainsListReducerCreator');
};
