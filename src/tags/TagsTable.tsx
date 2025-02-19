import { splitEvery } from '@shlinkio/data-manipulation';
import { SimpleCard, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useEffect, useRef } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { SimplePaginator } from '../utils/components/SimplePaginator';
import { useQueryState } from '../utils/helpers/hooks';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import type { TagsListChildrenProps, TagsOrder, TagsOrderableFields } from './data/TagsListChildrenProps';
import type { TagsTableRowProps } from './TagsTableRow';
import './TagsTable.scss';

export interface TagsTableProps extends TagsListChildrenProps {
  orderByColumn: (field: TagsOrderableFields) => () => void;
  currentOrder: TagsOrder;
}

type TagsTableDeps = {
  TagsTableRow: FC<TagsTableRowProps>;
};

const TAGS_PER_PAGE = 20; // TODO Allow customizing this value in settings

const TagsTable: FCWithDeps<TagsTableProps, TagsTableDeps> = ({ sortedTags, orderByColumn, currentOrder }) => {
  const { TagsTableRow } = useDependencies(TagsTable);
  const isFirstLoad = useRef(true);
  const { page: pageFromQuery = 1 } = useParsedQuery<{ page?: number | string }>();
  const [page, setPage] = useQueryState<number>('page', Number(pageFromQuery));
  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    scrollTo(0, 0);
  }, [setPage]);
  const pages = splitEvery(sortedTags, TAGS_PER_PAGE);
  const showPaginator = pages.length > 1;
  const currentPage = pages[page - 1] ?? [];

  useEffect(() => {
    if (!isFirstLoad.current) {
      updatePage(1);
    }
    isFirstLoad.current = false;
  }, [updatePage, sortedTags]);

  return (
    <SimpleCard key={page} bodyClassName={showPaginator ? 'pb-1' : ''}>
      <table className="table table-hover responsive-table mb-0">
        <thead className="responsive-table__header">
          <tr>
            <th className="tags-table__header-cell" onClick={orderByColumn('tag')}>
              Tag <TableOrderIcon currentOrder={currentOrder} field="tag" />
            </th>
            <th className="tags-table__header-cell text-lg-end" onClick={orderByColumn('shortUrls')}>
              Short URLs <TableOrderIcon currentOrder={currentOrder} field="shortUrls" />
            </th>
            <th className="tags-table__header-cell text-lg-end" onClick={orderByColumn('visits')}>
              Visits <TableOrderIcon currentOrder={currentOrder} field="visits" />
            </th>
            <th className="tags-table__header-cell">
              <span className="sr-only">Options</span>
            </th>
          </tr>
          <tr><th aria-hidden colSpan={4} className="p-0 border-top-0" /></tr>
        </thead>
        <tbody>
          {currentPage.length === 0 && <tr><td colSpan={4} className="text-center">No tags found</td></tr>}
          {currentPage.map((tag) => <TagsTableRow key={tag.tag} tag={tag} />)}
        </tbody>
      </table>

      {showPaginator && (
        <div className="sticky-card-paginator">
          <SimplePaginator pagesCount={pages.length} currentPage={page} onPageChange={updatePage} />
        </div>
      )}
    </SimpleCard>
  );
};

export const TagsTableFactory = componentFactory(TagsTable, ['TagsTableRow']);
