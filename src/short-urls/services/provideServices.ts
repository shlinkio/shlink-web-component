import type Bottle from 'bottlejs';
import { ShortUrlsFilteringBarFactory } from '../ShortUrlsFilteringBar';
import { ShortUrlsListFactory } from '../ShortUrlsList';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('ShortUrlsList', ShortUrlsListFactory);
  bottle.factory('ShortUrlsFilteringBar', ShortUrlsFilteringBarFactory);
};
