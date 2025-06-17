import { Table } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { UnstyledButton } from '../utils/components/UnstyledButton';
import type { ShortUrlsOrderableFields } from './data';
import type { ShortUrlsRowType } from './helpers/ShortUrlsRow';
import type { ShortUrlsList as ShortUrlsListState } from './reducers/shortUrlsList';

type ShortUrlsTableProps = {
  orderByColumn?: (column: ShortUrlsOrderableFields) => () => void;
  renderOrderIcon?: (column: ShortUrlsOrderableFields) => ReactNode;
  shortUrlsList: ShortUrlsListState;
  onTagClick?: (tag: string) => void;
};

type ShortUrlsTableDeps = {
  ShortUrlsRow: ShortUrlsRowType;
};

type ShortUrlsTableBodyProps = ShortUrlsTableDeps & Pick<ShortUrlsTableProps, 'shortUrlsList' | 'onTagClick'>;

const FullRow: FC<PropsWithChildren<{ danger?: boolean }>> = ({ children, danger }) => (
  <Table.Row>
    <Table.Cell colSpan={6} className={clsx('text-center', { 'text-danger font-bold': danger })}>
      {children}
    </Table.Cell>
  </Table.Row>
);

const ShortUrlsTableBody: FC<ShortUrlsTableBodyProps> = ({ shortUrlsList, onTagClick, ShortUrlsRow }) => {
  const { error, loading, shortUrls } = shortUrlsList;

  if (error) {
    return <FullRow danger>Something went wrong while loading short URLs :(</FullRow>;
  }

  if (loading) {
    return <FullRow>Loading...</FullRow>;
  }

  if (!shortUrls || shortUrls.data.length === 0) {
    return <FullRow>No results found</FullRow>;
  }

  return shortUrls?.data.map((shortUrl) => (
    <ShortUrlsRow
      key={shortUrl.shortUrl}
      shortUrl={shortUrl}
      onTagClick={onTagClick}
    />
  ));
};

const ShortUrlsTable: FCWithDeps<ShortUrlsTableProps, ShortUrlsTableDeps> = ({
  orderByColumn,
  renderOrderIcon,
  shortUrlsList,
  onTagClick,
}: ShortUrlsTableProps) => {
  const { ShortUrlsRow } = useDependencies(ShortUrlsTable);
  const columnsClasses = clsx({ 'cursor-pointer': !!orderByColumn });

  return (
    <Table
      className="mb-[-1px] w-full"
      header={(
        <Table.Row>
          <Table.Cell className={columnsClasses} onClick={orderByColumn?.('dateCreated')}>
            Created at {renderOrderIcon?.('dateCreated')}
          </Table.Cell>
          <Table.Cell className={columnsClasses} onClick={orderByColumn?.('shortCode')}>
            Short URL {renderOrderIcon?.('shortCode')}
          </Table.Cell>
          <Table.Cell>
            <UnstyledButton className={clsx('p-0', columnsClasses)} onClick={orderByColumn?.('title')}>
              Title {renderOrderIcon?.('title')}
            </UnstyledButton>
            &nbsp;&nbsp;/&nbsp;&nbsp;
            <UnstyledButton className={clsx('p-0', columnsClasses)} onClick={orderByColumn?.('longUrl')}>
              <span className="whitespace-nowrap">Long URL</span> {renderOrderIcon?.('longUrl')}
            </UnstyledButton>
          </Table.Cell>
          <Table.Cell>Tags</Table.Cell>
          <Table.Cell className={columnsClasses} onClick={orderByColumn?.('visits')}>
            <span className="whitespace-nowrap">Visits {renderOrderIcon?.('visits')}</span>
          </Table.Cell>
          <Table.Cell colSpan={2} aria-hidden />
        </Table.Row>
      )}
    >
      <ShortUrlsTableBody ShortUrlsRow={ShortUrlsRow} shortUrlsList={shortUrlsList} onTagClick={onTagClick} />
    </Table>
  );
};

export type ShortUrlsTableType = typeof ShortUrlsTable;

export const ShortUrlsTableFactory = componentFactory(ShortUrlsTable, ['ShortUrlsRow']);
