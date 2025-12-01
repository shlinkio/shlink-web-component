import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { CreateShortUrlFactory } from '../CreateShortUrl';
import { EditShortUrlFactory } from '../EditShortUrl';
import { ExportShortUrlsBtnFactory } from '../helpers/ExportShortUrlsBtn';
import { ShortUrlsRowFactory } from '../helpers/ShortUrlsRow';
import { shortUrlsDetailsReducerCreator } from '../reducers/shortUrlsDetails';
import { ShortUrlFormFactory } from '../ShortUrlForm';
import { ShortUrlsFilteringBarFactory } from '../ShortUrlsFilteringBar';
import { ShortUrlsListFactory } from '../ShortUrlsList';
import { ShortUrlsTableFactory } from '../ShortUrlsTable';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.factory('ShortUrlsList', ShortUrlsListFactory);

  bottle.factory('ShortUrlsTable', ShortUrlsTableFactory);
  bottle.factory('ShortUrlsRow', ShortUrlsRowFactory);

  bottle.factory('ShortUrlForm', ShortUrlFormFactory);

  bottle.factory('CreateShortUrl', CreateShortUrlFactory);
  bottle.decorator(
    'CreateShortUrl',
    connect(['shortUrlCreation'], ['resetCreateShortUrl']),
  );

  bottle.factory('EditShortUrl', EditShortUrlFactory);
  bottle.decorator('EditShortUrl', connect(['shortUrlsDetails'], ['getShortUrlsDetails']));

  bottle.factory('ExportShortUrlsBtn', ExportShortUrlsBtnFactory);

  bottle.factory('ShortUrlsFilteringBar', ShortUrlsFilteringBarFactory);

  bottle.serviceFactory('shortUrlsDetailsReducerCreator', shortUrlsDetailsReducerCreator, 'apiClientFactory');
  bottle.serviceFactory('shortUrlsDetailsReducer', (obj) => obj.reducer, 'shortUrlsDetailsReducerCreator');

  // Actions
  bottle.serviceFactory('getShortUrlsDetails', (obj) => obj.getShortUrlsDetails, 'shortUrlsDetailsReducerCreator');
};
