import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { CreateShortUrlFactory } from '../CreateShortUrl';
import { EditShortUrlFactory } from '../EditShortUrl';
import { DeleteShortUrlModal } from '../helpers/DeleteShortUrlModal';
import { ExportShortUrlsBtnFactory } from '../helpers/ExportShortUrlsBtn';
import { ShortUrlsRowFactory } from '../helpers/ShortUrlsRow';
import { ShortUrlsRowMenuFactory } from '../helpers/ShortUrlsRowMenu';
import { deleteShortUrl, shortUrlDeleted, shortUrlDeletionReducerCreator } from '../reducers/shortUrlDeletion';
import { editShortUrl, shortUrlEditionReducerCreator } from '../reducers/shortUrlEdition';
import { shortUrlsDetailsReducerCreator } from '../reducers/shortUrlsDetails';
import { listShortUrls, shortUrlsListReducerCreator } from '../reducers/shortUrlsList';
import { ShortUrlFormFactory } from '../ShortUrlForm';
import { ShortUrlsFilteringBarFactory } from '../ShortUrlsFilteringBar';
import { ShortUrlsListFactory } from '../ShortUrlsList';
import { ShortUrlsTableFactory } from '../ShortUrlsTable';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.factory('ShortUrlsList', ShortUrlsListFactory);
  bottle.decorator('ShortUrlsList', connect(['shortUrlsList'], ['listShortUrls', 'createNewVisits']));

  bottle.factory('ShortUrlsTable', ShortUrlsTableFactory);
  bottle.factory('ShortUrlsRow', ShortUrlsRowFactory);

  bottle.factory('ShortUrlsRowMenu', ShortUrlsRowMenuFactory);
  bottle.decorator('ShortUrlsRowMenu', connect(null, ['shortUrlDeleted', 'deleteShortUrl']));

  bottle.factory('ShortUrlForm', ShortUrlFormFactory);
  bottle.decorator('ShortUrlForm', connect(['tagsList', 'domainsList']));

  bottle.factory('CreateShortUrl', CreateShortUrlFactory);
  bottle.decorator(
    'CreateShortUrl',
    connect(['shortUrlCreation'], ['resetCreateShortUrl']),
  );

  bottle.factory('EditShortUrl', EditShortUrlFactory);
  bottle.decorator('EditShortUrl', connect(
    ['shortUrlsDetails', 'shortUrlEdition'],
    ['getShortUrlsDetails', 'editShortUrl'],
  ));

  bottle.serviceFactory('DeleteShortUrlModal', () => DeleteShortUrlModal);
  bottle.decorator('DeleteShortUrlModal', connect(['shortUrlDeletion'], ['resetDeleteShortUrl']));

  bottle.factory('ExportShortUrlsBtn', ExportShortUrlsBtnFactory);

  bottle.factory('ShortUrlsFilteringBar', ShortUrlsFilteringBarFactory);
  bottle.decorator('ShortUrlsFilteringBar', connect(['tagsList', 'domainsList']));

  // Reducers
  bottle.serviceFactory(
    'shortUrlsListReducerCreator',
    shortUrlsListReducerCreator,
    'listShortUrls',
    'editShortUrl',
  );
  bottle.serviceFactory('shortUrlsListReducer', (obj) => obj.reducer, 'shortUrlsListReducerCreator');

  bottle.serviceFactory('shortUrlEditionReducerCreator', shortUrlEditionReducerCreator, 'editShortUrl');
  bottle.serviceFactory('shortUrlEditionReducer', (obj) => obj.reducer, 'shortUrlEditionReducerCreator');

  bottle.serviceFactory('shortUrlDeletionReducerCreator', shortUrlDeletionReducerCreator, 'deleteShortUrl');
  bottle.serviceFactory('shortUrlDeletionReducer', (obj) => obj.reducer, 'shortUrlDeletionReducerCreator');

  bottle.serviceFactory('shortUrlsDetailsReducerCreator', shortUrlsDetailsReducerCreator, 'apiClientFactory');
  bottle.serviceFactory('shortUrlsDetailsReducer', (obj) => obj.reducer, 'shortUrlsDetailsReducerCreator');

  // Actions
  bottle.serviceFactory('listShortUrls', listShortUrls, 'apiClientFactory');

  bottle.serviceFactory('deleteShortUrl', deleteShortUrl, 'apiClientFactory');
  bottle.serviceFactory('resetDeleteShortUrl', (obj) => obj.resetDeleteShortUrl, 'shortUrlDeletionReducerCreator');
  bottle.serviceFactory('shortUrlDeleted', () => shortUrlDeleted);

  bottle.serviceFactory('getShortUrlsDetails', (obj) => obj.getShortUrlsDetails, 'shortUrlsDetailsReducerCreator');

  bottle.serviceFactory('editShortUrl', editShortUrl, 'apiClientFactory');
};
