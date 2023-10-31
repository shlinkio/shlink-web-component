import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { DomainSelector } from '../DomainSelector';
import { ManageDomains } from '../ManageDomains';
import { editDomainRedirects } from '../reducers/domainRedirects';
import { domainsListReducerCreator } from '../reducers/domainsList';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('DomainSelector', () => DomainSelector);
  bottle.decorator('DomainSelector', connect(['domainsList'], ['listDomains']));

  bottle.serviceFactory('ManageDomains', () => ManageDomains);
  bottle.decorator('ManageDomains', connect(
    ['domainsList'],
    ['listDomains', 'filterDomains', 'editDomainRedirects', 'checkDomainHealth'],
  ));

  // Reducer
  bottle.serviceFactory(
    'domainsListReducerCreator',
    domainsListReducerCreator,
    'apiClientFactory',
    'editDomainRedirects',
  );
  bottle.serviceFactory('domainsListReducer', (obj) => obj.reducer, 'domainsListReducerCreator');

  // Actions
  bottle.serviceFactory('listDomains', (obj) => obj.listDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('filterDomains', (obj) => obj.filterDomains, 'domainsListReducerCreator');
  bottle.serviceFactory('editDomainRedirects', editDomainRedirects, 'apiClientFactory');
  bottle.serviceFactory('checkDomainHealth', (obj) => obj.checkDomainHealth, 'domainsListReducerCreator');
};
