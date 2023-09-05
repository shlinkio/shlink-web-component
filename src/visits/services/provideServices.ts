import type Bottle from 'bottlejs';
import { prop } from 'ramda';
import type { ConnectDecorator } from '../../container';
import { DomainVisitsFactory } from '../DomainVisits';
import { MapModal } from '../helpers/MapModal';
import { NonOrphanVisitsFactory } from '../NonOrphanVisits';
import { OrphanVisitsFactory } from '../OrphanVisits';
import { domainVisitsReducerCreator, getDomainVisits } from '../reducers/domainVisits';
import { getNonOrphanVisits, nonOrphanVisitsReducerCreator } from '../reducers/nonOrphanVisits';
import { getOrphanVisits, orphanVisitsReducerCreator } from '../reducers/orphanVisits';
import { getShortUrlVisits, shortUrlVisitsReducerCreator } from '../reducers/shortUrlVisits';
import { getTagVisits, tagVisitsReducerCreator } from '../reducers/tagVisits';
import { createNewVisits } from '../reducers/visitCreation';
import { loadVisitsOverview, visitsOverviewReducerCreator } from '../reducers/visitsOverview';
import { ShortUrlVisitsFactory } from '../ShortUrlVisits';
import { TagVisitsFactory } from '../TagVisits';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('MapModal', () => MapModal);

  bottle.factory('ShortUrlVisits', ShortUrlVisitsFactory);
  bottle.decorator('ShortUrlVisits', connect(
    ['shortUrlVisits', 'shortUrlDetail', 'mercureInfo'],
    ['getShortUrlVisits', 'getShortUrlDetail', 'cancelGetShortUrlVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('TagVisits', TagVisitsFactory);
  bottle.decorator('TagVisits', connect(
    ['tagVisits', 'mercureInfo'],
    ['getTagVisits', 'cancelGetTagVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.decorator('DomainVisits', connect(
    ['domainVisits', 'mercureInfo'],
    ['getDomainVisits', 'cancelGetDomainVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.decorator('OrphanVisits', connect(
    ['orphanVisits', 'mercureInfo'],
    ['getOrphanVisits', 'cancelGetOrphanVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('NonOrphanVisits', NonOrphanVisitsFactory);
  bottle.decorator('NonOrphanVisits', connect(
    ['nonOrphanVisits', 'mercureInfo'],
    ['getNonOrphanVisits', 'cancelGetNonOrphanVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);

  // Actions
  bottle.serviceFactory('getShortUrlVisits', getShortUrlVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetShortUrlVisits', prop('cancelGetVisits'), 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory('getTagVisits', getTagVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetTagVisits', prop('cancelGetVisits'), 'tagVisitsReducerCreator');

  bottle.serviceFactory('getDomainVisits', getDomainVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetDomainVisits', prop('cancelGetVisits'), 'domainVisitsReducerCreator');

  bottle.serviceFactory('getOrphanVisits', getOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetOrphanVisits', prop('cancelGetVisits'), 'orphanVisitsReducerCreator');

  bottle.serviceFactory('getNonOrphanVisits', getNonOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetNonOrphanVisits', prop('cancelGetVisits'), 'nonOrphanVisitsReducerCreator');

  bottle.serviceFactory('createNewVisits', () => createNewVisits);
  bottle.serviceFactory('loadVisitsOverview', loadVisitsOverview, 'apiClientFactory');

  // Reducers
  bottle.serviceFactory('visitsOverviewReducerCreator', visitsOverviewReducerCreator, 'loadVisitsOverview');
  bottle.serviceFactory('visitsOverviewReducer', prop('reducer'), 'visitsOverviewReducerCreator');

  bottle.serviceFactory('domainVisitsReducerCreator', domainVisitsReducerCreator, 'getDomainVisits');
  bottle.serviceFactory('domainVisitsReducer', prop('reducer'), 'domainVisitsReducerCreator');

  bottle.serviceFactory('nonOrphanVisitsReducerCreator', nonOrphanVisitsReducerCreator, 'getNonOrphanVisits');
  bottle.serviceFactory('nonOrphanVisitsReducer', prop('reducer'), 'nonOrphanVisitsReducerCreator');

  bottle.serviceFactory('orphanVisitsReducerCreator', orphanVisitsReducerCreator, 'getOrphanVisits');
  bottle.serviceFactory('orphanVisitsReducer', prop('reducer'), 'orphanVisitsReducerCreator');

  bottle.serviceFactory('shortUrlVisitsReducerCreator', shortUrlVisitsReducerCreator, 'getShortUrlVisits');
  bottle.serviceFactory('shortUrlVisitsReducer', prop('reducer'), 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory('tagVisitsReducerCreator', tagVisitsReducerCreator, 'getTagVisits');
  bottle.serviceFactory('tagVisitsReducer', prop('reducer'), 'tagVisitsReducerCreator');
};
