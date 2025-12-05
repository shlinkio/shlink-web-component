import type Bottle from 'bottlejs';
import { EditTagModalFactory } from '../helpers/EditTagModal';
import { TagsListFactory } from '../TagsList';
import { TagsTableFactory } from '../TagsTable';
import { TagsTableRowFactory } from '../TagsTableRow';

export const provideServices = (bottle: Bottle) => {
  // Components
  bottle.factory('EditTagModal', EditTagModalFactory);
  bottle.factory('TagsTableRow', TagsTableRowFactory);
  bottle.factory('TagsTable', TagsTableFactory);
  bottle.factory('TagsList', TagsListFactory);
};
