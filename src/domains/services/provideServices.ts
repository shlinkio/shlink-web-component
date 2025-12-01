import type Bottle from 'bottlejs';
import { ManageDomains } from '../ManageDomains';

export const provideServices = (bottle: Bottle) => {
  bottle.serviceFactory('ManageDomains', () => ManageDomains);
};
