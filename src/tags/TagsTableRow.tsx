import {
  faChartLine as lineChartIcon,
  faPencilAlt as editIcon,
  faTrash as deleteIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Link } from 'react-router';
import { DropdownItem } from 'reactstrap';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { prettify } from '../utils/helpers/numbers';
import { useRoutesPrefix } from '../utils/routesPrefix';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import { useVisitsComparisonContext } from '../visits/visits-comparison/VisitsComparisonContext';
import type { SimplifiedTag, TagModalProps } from './data';
import { TagBullet } from './helpers/TagBullet';

export type TagsTableRowProps = {
  tag: SimplifiedTag;
};

type TagsTableRowDeps = {
  DeleteTagConfirmModal: FC<TagModalProps>;
  EditTagModal: FC<TagModalProps>;
  ColorGenerator: ColorGenerator;
};

const TagsTableRow: FCWithDeps<TagsTableRowProps, TagsTableRowDeps> = ({ tag }) => {
  const { DeleteTagConfirmModal, EditTagModal, ColorGenerator: colorGenerator } = useDependencies(TagsTableRow);
  const [isDeleteModalOpen, toggleDelete] = useToggle();
  const [isEditModalOpen, toggleEdit] = useToggle();
  const routesPrefix = useRoutesPrefix();
  const visitsComparison = useVisitsComparisonContext();

  return (
    <tr className="responsive-table__row">
      <th className="responsive-table__cell" data-th="Tag">
        <TagBullet tag={tag.tag} colorGenerator={colorGenerator} /> {tag.tag}
      </th>
      <td className="responsive-table__cell text-lg-end" data-th="Short URLs">
        <Link to={`${routesPrefix}/list-short-urls/1?tags=${encodeURIComponent(tag.tag)}`}>
          {prettify(tag.shortUrls)}
        </Link>
      </td>
      <td className="responsive-table__cell text-lg-end" data-th="Visits">
        <Link to={`${routesPrefix}/tag/${tag.tag}/visits`}>
          {prettify(tag.visits)}
        </Link>
      </td>
      <td className="responsive-table__cell text-lg-end">
        <RowDropdownBtn>
          <DropdownItem onClick={toggleEdit}>
            <FontAwesomeIcon icon={editIcon} fixedWidth className="me-1" /> Edit
          </DropdownItem>
          <DropdownItem
            disabled={!visitsComparison || !visitsComparison.canAddItemWithName(tag.tag)}
            onClick={() => visitsComparison?.addItemToCompare({
              name: tag.tag,
              query: tag.tag,
              style: colorGenerator.stylesForKey(tag.tag),
            })}
          >
            <FontAwesomeIcon icon={lineChartIcon} fixedWidth /> Compare visits
          </DropdownItem>

          <DropdownItem divider tag="hr" />

          <DropdownItem className="tw:text-danger" onClick={toggleDelete}>
            <FontAwesomeIcon icon={deleteIcon} fixedWidth className="me-1" /> Delete tag
          </DropdownItem>
        </RowDropdownBtn>
      </td>

      <EditTagModal tag={tag.tag} toggle={toggleEdit} isOpen={isEditModalOpen} />
      <DeleteTagConfirmModal tag={tag.tag} toggle={toggleDelete} isOpen={isDeleteModalOpen} />
    </tr>
  );
};

export const TagsTableRowFactory = componentFactory(
  TagsTableRow,
  ['DeleteTagConfirmModal', 'EditTagModal', 'ColorGenerator'],
);
