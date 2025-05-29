import {
  faChartLine as lineChartIcon,
  faPencilAlt as editIcon,
  faTrash as deleteIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RowDropdownBtn, useToggle } from '@shlinkio/shlink-frontend-kit';
import { Table } from '@shlinkio/shlink-frontend-kit/tailwind';
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
    <Table.Row className="tw:max-lg:relative">
      <Table.Cell columnName="Tag">
        <TagBullet tag={tag.tag} colorGenerator={colorGenerator} /> {tag.tag}
      </Table.Cell>
      <Table.Cell className="tw:lg:text-right" columnName="Short URLs">
        <Link to={`${routesPrefix}/list-short-urls/1?tags=${encodeURIComponent(tag.tag)}`}>
          {prettify(tag.shortUrls)}
        </Link>
      </Table.Cell>
      <Table.Cell className="tw:lg:text-right" columnName="Visits">
        <Link to={`${routesPrefix}/tag/${tag.tag}/visits`}>
          {prettify(tag.visits)}
        </Link>
      </Table.Cell>
      <Table.Cell className="tw:lg:text-right tw:max-lg:absolute tw:max-lg:top-[-19px] tw:max-lg:right-0 tw:max-lg:p-0">
        <RowDropdownBtn>
          <DropdownItem onClick={toggleEdit}>
            <FontAwesomeIcon icon={editIcon} fixedWidth className="tw:mr-1" /> Edit
          </DropdownItem>
          <DropdownItem
            disabled={!visitsComparison || !visitsComparison.canAddItemWithName(tag.tag)}
            onClick={() => visitsComparison?.addItemToCompare({
              name: tag.tag,
              query: tag.tag,
              style: colorGenerator.stylesForKey(tag.tag),
            })}
          >
            <FontAwesomeIcon icon={lineChartIcon} fixedWidth className="tw:mr-1" /> Compare visits
          </DropdownItem>

          <DropdownItem divider tag="hr" />

          <DropdownItem className="tw:text-danger" onClick={toggleDelete}>
            <FontAwesomeIcon icon={deleteIcon} fixedWidth className="tw:mr-1" /> Delete tag
          </DropdownItem>
        </RowDropdownBtn>
      </Table.Cell>

      <EditTagModal tag={tag.tag} toggle={toggleEdit} isOpen={isEditModalOpen} />
      <DeleteTagConfirmModal tag={tag.tag} toggle={toggleDelete} isOpen={isDeleteModalOpen} />
    </Table.Row>
  );
};

export const TagsTableRowFactory = componentFactory(
  TagsTableRow,
  ['DeleteTagConfirmModal', 'EditTagModal', 'ColorGenerator'],
);
