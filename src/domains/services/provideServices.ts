import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { ManageDomains } from '../ManageDomains';
import { editDomainRedirects } from '../reducers/domainRedirects';
import { domainsListReducerCreator } from '../reducers/domainsList';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  bottle.serviceFactory('ManageDomains', () => ManageDomains);
  bottle.decorator('ManageDomains', connect(
    ['domainsList'],
    ['filterDomains', 'editDomainRedirects', 'checkDomainHealth'],
  ));

  // Reducer
  bottle.serviceFactory(
    'domainsListReducerCreator',
    domainsListReducerCreator,
    'apiClientFactory',
    'editDomainRedirects',
    'createShortUrl',
  );
  bottle.serviceFactory('domainsListReducer', (obj) => obj.reducer, 'domainsListReducerCreator');

  // Actions
  bottle.serviceFactory('listDomains', (obj) => obj.listDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('filterDomains', (obj) => obj.filterDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('editDomainRedirects', editDomainRedirects, 'apiClientFactory');
  bottle.serviceFactory('checkDomainHealth', (obj) => obj.checkDomainHealth, 'domainsListReducerCreator');
};
