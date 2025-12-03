import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { DomainVisitsFactory } from '../DomainVisits';
import { MapModal } from '../helpers/MapModal';
import { NonOrphanVisitsFactory } from '../NonOrphanVisits';
import { OrphanVisitsFactory } from '../OrphanVisits';
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

  bottle.factory('TagVisits', TagVisitsFactory);

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
    ['shortUrlVisitsComparison'],
    ['getShortUrlVisitsForComparison', 'cancelGetShortUrlVisitsForComparison'],
  ));

  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.factory('NonOrphanVisits', NonOrphanVisitsFactory);

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);

  // Actions
  bottle.serviceFactory('getShortUrlVisitsForComparison', getShortUrlVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetShortUrlVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'shortUrlVisitsComparisonReducerCreator',
  );

  bottle.serviceFactory('getTagVisitsForComparison', getTagVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetTagVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'tagVisitsComparisonReducerCreator',
  );

  bottle.serviceFactory('getDomainVisitsForComparison', getDomainVisitsForComparison, 'apiClientFactory');
  bottle.serviceFactory(
    'cancelGetDomainVisitsForComparison',
    (obj) => obj.cancelGetVisits,
    'domainVisitsComparisonReducerCreator',
  );

  // Reducers
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
