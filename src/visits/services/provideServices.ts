import type Bottle from 'bottlejs';
import { DomainVisitsFactory } from '../DomainVisits';
import { NonOrphanVisitsFactory } from '../NonOrphanVisits';
import { OrphanVisitsFactory } from '../OrphanVisits';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('DomainVisits', DomainVisitsFactory);
  bottle.factory('OrphanVisits', OrphanVisitsFactory);
  bottle.factory('NonOrphanVisits', NonOrphanVisitsFactory);

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);
};
