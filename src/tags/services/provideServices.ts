import type Bottle from 'bottlejs';
import { EditTagModalFactory } from '../helpers/EditTagModal';
import { TagsSearchDropdownFactory } from '../helpers/TagsSearchDropdown';
import { TagsSelectorFactory } from '../helpers/TagsSelector';
import { TagsListFactory } from '../TagsList';
import { TagsTableFactory } from '../TagsTable';
import { TagsTableRowFactory } from '../TagsTableRow';

export const provideServices = (bottle: Bottle) => {
  // Components
  bottle.factory('TagsSelector', TagsSelectorFactory);
  bottle.factory('TagsSearchDropdown', TagsSearchDropdownFactory);

  bottle.factory('EditTagModal', EditTagModalFactory);

  bottle.factory('TagsTableRow', TagsTableRowFactory);
  bottle.factory('TagsTable', TagsTableFactory);

  bottle.factory('TagsList', TagsListFactory);
};
