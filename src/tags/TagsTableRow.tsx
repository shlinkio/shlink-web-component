import {
  faChartLine as lineChartIcon,
  faPencilAlt as editIcon,
  faTrash as deleteIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber, RowDropdown, Table,useToggle  } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
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
  const { flag: isDeleteModalOpen, setToFalse: closeDelete, setToTrue: openDelete } = useToggle();
  const { flag: isEditModalOpen, setToFalse: closeEdit, setToTrue: openEdit } = useToggle();
  const routesPrefix = useRoutesPrefix();
  const visitsComparison = useVisitsComparisonContext();

  return (
    <Table.Row className="max-lg:relative">
      <Table.Cell columnName="Tag">
        <TagBullet tag={tag.tag} colorGenerator={colorGenerator} /> {tag.tag}
      </Table.Cell>
      <Table.Cell className="lg:text-right" columnName="Short URLs">
        <Link to={`${routesPrefix}/list-short-urls/1?tags=${encodeURIComponent(tag.tag)}`}>
          {formatNumber(tag.shortUrls)}
        </Link>
      </Table.Cell>
      <Table.Cell className="lg:text-right" columnName="Visits">
        <Link to={`${routesPrefix}/tag/${tag.tag}/visits`}>
          {formatNumber(tag.visits)}
        </Link>
      </Table.Cell>
      <Table.Cell className="lg:text-right max-lg:absolute max-lg:top-1.25 max-lg:right-0 max-lg:p-0">
        <RowDropdown menuAlignment="right">
          <RowDropdown.Item onClick={openEdit} className="gap-1.5">
            <FontAwesomeIcon icon={editIcon} /> Edit
          </RowDropdown.Item>
          <RowDropdown.Item
            className="gap-1.5"
            disabled={!visitsComparison || !visitsComparison.canAddItemWithName(tag.tag)}
            onClick={() => visitsComparison?.addItemToCompare({
              name: tag.tag,
              query: tag.tag,
              style: colorGenerator.stylesForKey(tag.tag),
            })}
          >
            <FontAwesomeIcon icon={lineChartIcon} /> Compare visits
          </RowDropdown.Item>

          <RowDropdown.Separator />

          <RowDropdown.Item className="[&]:text-danger gap-1.5" onClick={openDelete}>
            <FontAwesomeIcon icon={deleteIcon} /> Delete tag
          </RowDropdown.Item>
        </RowDropdown>
      </Table.Cell>

      <EditTagModal tag={tag.tag} onClose={closeEdit} isOpen={isEditModalOpen} />
      <DeleteTagConfirmModal tag={tag.tag} onClose={closeDelete} isOpen={isDeleteModalOpen} />
    </Table.Row>
  );
};

export const TagsTableRowFactory = componentFactory(
  TagsTableRow,
  ['DeleteTagConfirmModal', 'EditTagModal', 'ColorGenerator'],
);
