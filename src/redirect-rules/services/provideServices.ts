import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { ShortUrlRedirectRules } from '../ShortUrlRedirectRules';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.serviceFactory('ShortUrlRedirectRules', () => ShortUrlRedirectRules);
  bottle.decorator('ShortUrlRedirectRules', connect(['shortUrlsDetails'], ['getShortUrlsDetails']));
};
