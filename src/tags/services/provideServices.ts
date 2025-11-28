import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { EditTagModalFactory } from '../helpers/EditTagModal';
import { TagsSearchDropdownFactory } from '../helpers/TagsSearchDropdown';
import { TagsSelectorFactory } from '../helpers/TagsSelector';
import { filterTags, listTags, tagsListReducerCreator } from '../reducers/tagsList';
import { TagsListFactory } from '../TagsList';
import { TagsTableFactory } from '../TagsTable';
import { TagsTableRowFactory } from '../TagsTableRow';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.factory('TagsSelector', TagsSelectorFactory);
  bottle.factory('TagsSearchDropdown', TagsSearchDropdownFactory);

  bottle.factory('EditTagModal', EditTagModalFactory);

  bottle.factory('TagsTableRow', TagsTableRowFactory);
  bottle.factory('TagsTable', TagsTableFactory);

  bottle.factory('TagsList', TagsListFactory);
  bottle.decorator('TagsList', connect(['tagsList'], ['filterTags']));

  // Reducers
  bottle.serviceFactory('tagsListReducerCreator', tagsListReducerCreator, 'listTags');
  bottle.serviceFactory('tagsListReducer', (obj) => obj.reducer, 'tagsListReducerCreator');

  // Actions
  bottle.serviceFactory('listTags', listTags, 'apiClientFactory');
  bottle.serviceFactory('filterTags', () => filterTags);
};
