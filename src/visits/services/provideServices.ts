import type Bottle from 'bottlejs';
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
import { ShortUrlVisitsFactory } from '../ShortUrlVisits';
import { TagVisitsFactory } from '../TagVisits';
import { DomainVisitsComparison } from '../visits-comparison/DomainVisitsComparison';
import {
  domainVisitsComparisonReducerCreator,
  getDomainVisitsForComparison,
} from '../visits-comparison/reducers/domainVisitsComparison';
import {
  getShortUrlVisitsForComparison,
  shortUrlVisitsComparisonReducerCreator,
} from '../visits-comparison/reducers/shortUrlVisitsComparison';
import {
  getTagVisitsForComparison,
  tagVisitsComparisonReducerCreator,
} from '../visits-comparison/reducers/tagVisitsComparison';
import { ShortUrlVisitsComparison } from '../visits-comparison/ShortUrlVisitsComparison';
import { TagVisitsComparisonFactory } from '../visits-comparison/TagVisitsComparison';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('MapModal', () => MapModal);

  bottle.factory('ShortUrlVisits', ShortUrlVisitsFactory);
  bottle.decorator('ShortUrlVisits', connect(
    ['shortUrlVisits', 'shortUrlsDetails'],
    ['getShortUrlVisits', 'getShortUrlsDetails', 'cancelGetShortUrlVisits'],
  ));

  bottle.factory('TagVisits', TagVisitsFactory);
  bottle.decorator('TagVisits', connect(['tagVisits'], ['getTagVisits', 'cancelGetTagVisits']));

  bottle.factory('TagVisitsComparison', TagVisitsComparisonFactory);
  bottle.decorator('TagVisitsComparison', connect(
    ['tagVisitsComparison'],
    ['getTagVisitsForComparison', 'cancelGetTagVisitsForComparison'],
  ));

  bottle.serviceFactory('DomainVisitsComparison', () => DomainVisitsComparison);
  bottle.decorator('DomainVisitsComparison', connect(
    ['domainVisitsComparison'],
    ['getDomainVisitsForComparison', 'cancelGetDomainVisitsForComparison'],
  ));

  bottle.serviceFactory('ShortUrlVisitsComparison', () => ShortUrlVisitsComparison);
  bottle.decorator('ShortUrlVisitsComparison', connect(
    ['shortUrlVisitsComparison', 'shortUrlsDetails'],
    ['getShortUrlVisitsForComparison', 'cancelGetShortUrlVisitsForComparison', 'getShortUrlsDetails'],
  ));

  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.decorator('DomainVisits', connect(['domainVisits'], ['getDomainVisits', 'cancelGetDomainVisits']));

  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.decorator('OrphanVisits', connect(['orphanVisits'], ['getOrphanVisits', 'cancelGetOrphanVisits']));

  bottle.factory('NonOrphanVisits', NonOrphanVisitsFactory);
  bottle.decorator('NonOrphanVisits', connect(['nonOrphanVisits'], ['getNonOrphanVisits', 'cancelGetNonOrphanVisits']));

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);

  // Actions
  bottle.serviceFactory('getShortUrlVisits', getShortUrlVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetShortUrlVisits', (obj) => obj.cancelGetVisits, 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory('getShortUrlVisitsForComparison', getShortUrlVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetShortUrlVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'shortUrlVisitsComparisonReducerCreator',
  );

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

  bottle.serviceFactory('getDomainVisitsForComparison', getDomainVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetDomainVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'domainVisitsComparisonReducerCreator',
  );

  bottle.serviceFactory('getOrphanVisits', getOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetOrphanVisits', (obj) => obj.cancelGetVisits, 'orphanVisitsReducerCreator');

  bottle.serviceFactory('getNonOrphanVisits', getNonOrphanVisits, 'apiClientFactory');
  bottle.serviceFactory('cancelGetNonOrphanVisits', (obj) => obj.cancelGetVisits, 'nonOrphanVisitsReducerCreator');

  // Reducers
  bottle.serviceFactory('domainVisitsReducerCreator', domainVisitsReducerCreator, 'getDomainVisits');
  bottle.serviceFactory('domainVisitsReducer', (obj) => obj.reducer, 'domainVisitsReducerCreator');

  bottle.serviceFactory('nonOrphanVisitsReducerCreator', nonOrphanVisitsReducerCreator, 'getNonOrphanVisits');
  bottle.serviceFactory('nonOrphanVisitsReducer', (obj) => obj.reducer, 'nonOrphanVisitsReducerCreator');

  bottle.serviceFactory(
    'orphanVisitsReducerCreator',
    orphanVisitsReducerCreator,
    'getOrphanVisits',
  );
  bottle.serviceFactory('orphanVisitsReducer', (obj) => obj.reducer, 'orphanVisitsReducerCreator');

  bottle.serviceFactory(
    'shortUrlVisitsReducerCreator',
    shortUrlVisitsReducerCreator,
    'getShortUrlVisits',
  );
  bottle.serviceFactory('shortUrlVisitsReducer', (obj) => obj.reducer, 'shortUrlVisitsReducerCreator');

  bottle.serviceFactory('tagVisitsReducerCreator', tagVisitsReducerCreator, 'getTagVisits');
  bottle.serviceFactory('tagVisitsReducer', (obj) => obj.reducer, 'tagVisitsReducerCreator');

  bottle.serviceFactory(
    'tagVisitsComparisonReducerCreator',
    tagVisitsComparisonReducerCreator,
    'getTagVisitsForComparison',
  );
  bottle.serviceFactory('tagVisitsComparisonReducer', (obj) => obj.reducer, 'tagVisitsComparisonReducerCreator');

  bottle.serviceFactory(
    'domainVisitsComparisonReducerCreator',
    domainVisitsComparisonReducerCreator,
    'getDomainVisitsForComparison',
  );
  bottle.serviceFactory('domainVisitsComparisonReducer', (obj) => obj.reducer, 'domainVisitsComparisonReducerCreator');

  bottle.serviceFactory(
    'shortUrlVisitsComparisonReducerCreator',
    shortUrlVisitsComparisonReducerCreator,
    'getShortUrlVisitsForComparison',
  );
  bottle.serviceFactory(
    'shortUrlVisitsComparisonReducer',
    (obj) => obj.reducer,
    'shortUrlVisitsComparisonReducerCreator',
  );
};
