import type Bottle from 'bottlejs';
import { DomainVisitsFactory } from '../DomainVisits';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('DomainVisits', DomainVisitsFactory);

  // Services
  bottle.serviceFactory('VisitsParser', () => visitsParser);
};
