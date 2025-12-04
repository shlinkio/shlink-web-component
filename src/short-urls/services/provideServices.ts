import type Bottle from 'bottlejs';
import { CreateShortUrlFactory } from '../CreateShortUrl';
import { EditShortUrlFactory } from '../EditShortUrl';
import { ShortUrlsRowFactory } from '../helpers/ShortUrlsRow';
import { ShortUrlFormFactory } from '../ShortUrlForm';
import { ShortUrlsFilteringBarFactory } from '../ShortUrlsFilteringBar';
import { ShortUrlsListFactory } from '../ShortUrlsList';
import { ShortUrlsTableFactory } from '../ShortUrlsTable';

export const provideServices = (bottle: Bottle) => {
  bottle.factory('ShortUrlsList', ShortUrlsListFactory);
  bottle.factory('ShortUrlsTable', ShortUrlsTableFactory);
  bottle.factory('ShortUrlsRow', ShortUrlsRowFactory);
  bottle.factory('ShortUrlForm', ShortUrlFormFactory);
  bottle.factory('CreateShortUrl', CreateShortUrlFactory);
  bottle.factory('EditShortUrl', EditShortUrlFactory);
  bottle.factory('ShortUrlsFilteringBar', ShortUrlsFilteringBarFactory);
};
