import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { DomainVisitsFactory } from '../DomainVisits';
import { MapModal } from '../helpers/MapModal';
import { NonOrphanVisitsFactory } from '../NonOrphanVisits';
import { OrphanVisitsFactory } from '../OrphanVisits';
import { domainVisitsReducerCreator, getDomainVisits } from '../reducers/domainVisits';
import { getNonOrphanVisits, nonOrphanVisitsReducerCreator } from '../reducers/nonOrphanVisits';
import { getOrphanVisits, orphanVisitsReducerCreator } from '../reducers/orphanVisits';
import { deleteOrphanVisits, orphanVisitsDeletionReducerCreator } from '../reducers/orphanVisitsDeletion';
import { getShortUrlVisits, shortUrlVisitsReducerCreator } from '../reducers/shortUrlVisits';
import { deleteShortUrlVisits, shortUrlVisitsDeletionReducerCreator } from '../reducers/shortUrlVisitsDeletion';
import { getTagVisits, tagVisitsReducerCreator } from '../reducers/tagVisits';
import { createNewVisits } from '../reducers/visitCreation';
import { loadVisitsOverview, visitsOverviewReducerCreator } from '../reducers/visitsOverview';
import { ShortUrlVisitsFactory } from '../ShortUrlVisits';
import { TagVisitsFactory } from '../TagVisits';
import {
  getTagVisitsForComparison,
  tagVisitsComparisonReducerCreator,
} from '../visits-comparison/reducers/tagVisitsComparison';
import { TagVisitsComparisonFactory } from '../visits-comparison/TagVisitsComparison';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('MapModal', () => MapModal);

  bottle.factory('ShortUrlVisits', ShortUrlVisitsFactory);
  bottle.decorator('ShortUrlVisits', connect([
    'shortUrlVisits',
    'shortUrlVisitsDeletion',
    'shortUrlDetail',
    'mercureInfo',
  ], [
    'getShortUrlVisits',
    'deleteShortUrlVisits',
    'getShortUrlDetail',
    'cancelGetShortUrlVisits',
    'createNewVisits',
    'loadMercureInfo',
  ]));

  bottle.factory('TagVisits', TagVisitsFactory);
  bottle.decorator('TagVisits', connect(
    ['tagVisits', 'mercureInfo'],
    ['getTagVisits', 'cancelGetTagVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('TagVisitsComparison', TagVisitsComparisonFactory);
  bottle.decorator('TagVisitsComparison', connect(
    ['tagVisitsComparison', 'mercureInfo'],
    ['getTagVisitsForComparison', 'cancelGetTagVisitsForComparison', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.decorator('DomainVisits', connect(
    ['domainVisits', 'mercureInfo'],
    ['getDomainVisits', 'cancelGetDomainVisits', 'createNewVisits', 'loadMercureInfo'],
  ));

  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.decorator('OrphanVisits', connect(
    ['orphanVisits', 'mercureInfo', 'orphanVisitsDeletion'],
    ['getOrphanVisits', 'cancelGetOrphanVisits', 'createNewVisits', 'loadMercureInfo', 'deleteOrphanVisits'],
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
  bottle.serviceFactory('cancelGetShortUrlVisits', (obj) => obj.cancelGetVisits, 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory('deleteShortUrlVisits', deleteShortUrlVisits, 'apiClientFactory');

  bottle.serviceFactory('getTagVisits', getTagVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetTagVisits', (obj) => obj.cancelGetVisits, 'tagVisitsReducerCreator');

  bottle.serviceFactory('getTagVisitsForComparison', getTagVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetTagVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'tagVisitsComparisonReducerCreator',
  );

  bottle.serviceFactory('getDomainVisits', getDomainVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetDomainVisits', (obj) => obj.cancelGetVisits, 'domainVisitsReducerCreator');

  bottle.serviceFactory('getOrphanVisits', getOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetOrphanVisits', (obj) => obj.cancelGetVisits, 'orphanVisitsReducerCreator');

  bottle.serviceFactory('deleteOrphanVisits', deleteOrphanVisits, 'apiClientFactory');

  bottle.serviceFactory('getNonOrphanVisits', getNonOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetNonOrphanVisits', (obj) => obj.cancelGetVisits, 'nonOrphanVisitsReducerCreator');

  bottle.serviceFactory('createNewVisits', () => createNewVisits);
  bottle.serviceFactory('loadVisitsOverview', loadVisitsOverview, 'apiClientFactory');

  // Reducers
  bottle.serviceFactory('visitsOverviewReducerCreator', visitsOverviewReducerCreator, 'loadVisitsOverview');
  bottle.serviceFactory('visitsOverviewReducer', (obj) => obj.reducer, 'visitsOverviewReducerCreator');

  bottle.serviceFactory('domainVisitsReducerCreator', domainVisitsReducerCreator, 'getDomainVisits');
  bottle.serviceFactory('domainVisitsReducer', (obj) => obj.reducer, 'domainVisitsReducerCreator');

  bottle.serviceFactory('nonOrphanVisitsReducerCreator', nonOrphanVisitsReducerCreator, 'getNonOrphanVisits');
  bottle.serviceFactory('nonOrphanVisitsReducer', (obj) => obj.reducer, 'nonOrphanVisitsReducerCreator');

  bottle.serviceFactory(
    'orphanVisitsReducerCreator',
    orphanVisitsReducerCreator,
    'getOrphanVisits',
    'deleteOrphanVisits',
  );
  bottle.serviceFactory('orphanVisitsReducer', (obj) => obj.reducer, 'orphanVisitsReducerCreator');

  bottle.serviceFactory(
    'orphanVisitsDeletionReducerCreator',
    orphanVisitsDeletionReducerCreator,
    'deleteOrphanVisits',
  );
  bottle.serviceFactory('orphanVisitsDeletionReducer', (obj) => obj.reducer, 'orphanVisitsDeletionReducerCreator');

  bottle.serviceFactory(
    'shortUrlVisitsReducerCreator',
    shortUrlVisitsReducerCreator,
    'getShortUrlVisits',
    'deleteShortUrlVisits',
  );
  bottle.serviceFactory('shortUrlVisitsReducer', (obj) => obj.reducer, 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory(
    'shortUrlVisitsDeletionReducerCreator',
    shortUrlVisitsDeletionReducerCreator,
    'deleteShortUrlVisits',
  );
  bottle.serviceFactory('shortUrlVisitsDeletionReducer', (obj) => obj.reducer, 'shortUrlVisitsDeletionReducerCreator');

  bottle.serviceFactory('tagVisitsReducerCreator', tagVisitsReducerCreator, 'getTagVisits');
  bottle.serviceFactory('tagVisitsReducer', (obj) => obj.reducer, 'tagVisitsReducerCreator');

  bottle.serviceFactory(
    'tagVisitsComparisonReducerCreator',
    tagVisitsComparisonReducerCreator,
    'getTagVisitsForComparison',
  );
  bottle.serviceFactory('tagVisitsComparisonReducer', (obj) => obj.reducer, 'tagVisitsComparisonReducerCreator');
};
