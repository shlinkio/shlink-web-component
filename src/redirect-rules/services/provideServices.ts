import type Bottle from 'bottlejs';
import { ShortUrlRedirectRules } from '../ShortUrlRedirectRules';

export const provideServices = (bottle: Bottle) => {
  bottle.serviceFactory('ShortUrlRedirectRules', () => ShortUrlRedirectRules);
};
