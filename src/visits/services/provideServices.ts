import type Bottle from 'bottlejs';
import * as visitsParser from './VisitsParser';

export const provideServices = (bottle: Bottle) => {
  bottle.serviceFactory('VisitsParser', () => visitsParser);
};
