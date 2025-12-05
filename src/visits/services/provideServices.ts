import type Bottle from 'bottlejs';
import { DomainVisitsFactory } from '../DomainVisits';
import { MapModal } from '../helpers/MapModal';
import { NonOrphanVisitsFactory } from '../NonOrphanVisits';
import { OrphanVisitsFactory } from '../OrphanVisits';
import { ShortUrlVisitsFactory } from '../ShortUrlVisits';
import { TagVisitsFactory } from '../TagVisits';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle) => {
  bottle.serviceFactory('MapModal', () => MapModal);

  bottle.factory('ShortUrlVisits', ShortUrlVisitsFactory);
  bottle.factory('TagVisits', TagVisitsFactory);
  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.factory('NonOrphanVisits', NonOrphanVisitsFactory);

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);
};
