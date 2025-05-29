import { splitEvery } from '@shlinkio/data-manipulation';
import { SimpleCard, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import { Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback , useEffect, useRef } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { SimplePaginator } from '../utils/components/SimplePaginator';
import { useQueryState } from '../utils/helpers/hooks';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import type { TagsListChildrenProps, TagsOrder, TagsOrderableFields } from './data/TagsListChildrenProps';
import type { TagsTableRowProps } from './TagsTableRow';

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

  const headerClasses = 'tw:cursor-pointer tw:top-(--header-height) tw:sticky-cell';

  return (
    <SimpleCard key={page} bodyClassName={showPaginator ? 'pb-1' : ''}>
      <Table
        header={
          <Table.Row>
            <Table.Cell onClick={orderByColumn('tag')} className={headerClasses}>
              Tag <TableOrderIcon currentOrder={currentOrder} field="tag" />
            </Table.Cell>
            <Table.Cell onClick={orderByColumn('shortUrls')} className={`tw:lg:text-right ${headerClasses}`}>
              Short URLs <TableOrderIcon currentOrder={currentOrder} field="shortUrls" />
            </Table.Cell>
            <Table.Cell onClick={orderByColumn('visits')} className={`tw:lg:text-right ${headerClasses}`}>
              Visits <TableOrderIcon currentOrder={currentOrder} field="visits" />
            </Table.Cell>
            <Table.Cell className={headerClasses}>
              <span className="sr-only">Options</span>
            </Table.Cell>
          </Table.Row>
        }
      >
        {currentPage.length === 0 && (
          <Table.Row>
            <Table.Cell colSpan={4} className="tw:text-center">No tags found</Table.Cell>
          </Table.Row>
        )}
        {currentPage.map((tag) => <TagsTableRow key={tag.tag} tag={tag} />)}
      </Table>

      {showPaginator && (
        <div
          className={clsx(
            'tw:sticky tw:bottom-0 tw:py-4 tw:-mx-0.5',
            'tw:flex tw:justify-around',
            'tw:bg-lm-primary tw:dark:bg-dm-primary',
            'tw:border-t tw:border-lm-border tw:dark:border-dm-border',
          )}
          data-testid="tags-paginator"
        >
          <SimplePaginator pagesCount={pages.length} currentPage={page} onPageChange={updatePage} />
        </div>
      )}
    </SimpleCard>
  );
};

export const TagsTableFactory = componentFactory(TagsTable, ['TagsTableRow']);
