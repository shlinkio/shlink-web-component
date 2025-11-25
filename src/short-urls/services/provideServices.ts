import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { CreateShortUrlFactory } from '../CreateShortUrl';
import { EditShortUrlFactory } from '../EditShortUrl';
import { DeleteShortUrlModal } from '../helpers/DeleteShortUrlModal';
import { ExportShortUrlsBtnFactory } from '../helpers/ExportShortUrlsBtn';
import { ShortUrlsRowFactory } from '../helpers/ShortUrlsRow';
import { ShortUrlsRowMenuFactory } from '../helpers/ShortUrlsRowMenu';
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

  bottle.factory('ShortUrlsRowMenu', ShortUrlsRowMenuFactory);

  bottle.factory('ShortUrlForm', ShortUrlFormFactory);
  bottle.decorator('ShortUrlForm', connect(['tagsList', 'domainsList']));

  bottle.factory('CreateShortUrl', CreateShortUrlFactory);
  bottle.decorator(
    'CreateShortUrl',
    connect(['shortUrlCreation'], ['resetCreateShortUrl']),
  );

  bottle.factory('EditShortUrl', EditShortUrlFactory);
  bottle.decorator('EditShortUrl', connect(['shortUrlsDetails'], ['getShortUrlsDetails']));

  bottle.serviceFactory('DeleteShortUrlModal', () => DeleteShortUrlModal);

  bottle.factory('ExportShortUrlsBtn', ExportShortUrlsBtnFactory);

  bottle.factory('ShortUrlsFilteringBar', ShortUrlsFilteringBarFactory);
  bottle.decorator('ShortUrlsFilteringBar', connect(['tagsList', 'domainsList']));

  bottle.serviceFactory('shortUrlsDetailsReducerCreator', shortUrlsDetailsReducerCreator, 'apiClientFactory');
  bottle.serviceFactory('shortUrlsDetailsReducer', (obj) => obj.reducer, 'shortUrlsDetailsReducerCreator');

  // Actions
  bottle.serviceFactory('getShortUrlsDetails', (obj) => obj.getShortUrlsDetails, 'shortUrlsDetailsReducerCreator');
};
