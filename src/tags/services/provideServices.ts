import type Bottle from 'bottlejs';
import type { ConnectDecorator } from '../../container';
import { DeleteTagConfirmModal } from '../helpers/DeleteTagConfirmModal';
import { EditTagModalFactory } from '../helpers/EditTagModal';
import { TagsSearchDropdownFactory } from '../helpers/TagsSearchDropdown';
import { TagsSelectorFactory } from '../helpers/TagsSelector';
import { tagDeleted, tagDeleteReducerCreator } from '../reducers/tagDelete';
import { editTag, tagEdited, tagEditReducerCreator } from '../reducers/tagEdit';
import { filterTags, listTags, tagsListReducerCreator } from '../reducers/tagsList';
import { TagsListFactory } from '../TagsList';
import { TagsTableFactory } from '../TagsTable';
import { TagsTableRowFactory } from '../TagsTableRow';

export const provideServices = (bottle: Bottle, connect: ConnectDecorator) => {
  // Components
  bottle.factory('TagsSelector', TagsSelectorFactory);
  bottle.factory('TagsSearchDropdown', TagsSearchDropdownFactory);

  bottle.serviceFactory('DeleteTagConfirmModal', () => DeleteTagConfirmModal);
  bottle.decorator('DeleteTagConfirmModal', connect(['tagDelete'], ['deleteTag', 'tagDeleted']));

  bottle.factory('EditTagModal', EditTagModalFactory);
  bottle.decorator('EditTagModal', connect(['tagEdit'], ['editTag', 'tagEdited']));

  bottle.factory('TagsTableRow', TagsTableRowFactory);
  bottle.factory('TagsTable', TagsTableFactory);

  bottle.factory('TagsList', TagsListFactory);
  bottle.decorator('TagsList', connect(
    ['tagsList', 'mercureInfo'],
    ['filterTags', 'createNewVisits', 'loadMercureInfo'],
  ));

  // Reducers
  bottle.serviceFactory('tagEditReducerCreator', tagEditReducerCreator, 'editTag');
  bottle.serviceFactory('tagEditReducer', (obj) => obj.reducer, 'tagEditReducerCreator');

  bottle.serviceFactory('tagDeleteReducerCreator', tagDeleteReducerCreator, 'apiClientFactory');
  bottle.serviceFactory('tagDeleteReducer', (obj) => obj.reducer, 'tagDeleteReducerCreator');

  bottle.serviceFactory('tagsListReducerCreator', tagsListReducerCreator, 'listTags');
  bottle.serviceFactory('tagsListReducer', (obj) => obj.reducer, 'tagsListReducerCreator');

  // Actions
  bottle.serviceFactory('listTags', listTags, 'apiClientFactory');
  bottle.serviceFactory('filterTags', () => filterTags);

  bottle.serviceFactory('deleteTag', (obj) => obj.deleteTag, 'tagDeleteReducerCreator');
  bottle.serviceFactory('tagDeleted', () => tagDeleted);

  bottle.serviceFactory('editTag', editTag, 'apiClientFactory', 'ColorGenerator');
  bottle.serviceFactory('tagEdited', () => tagEdited);
};
