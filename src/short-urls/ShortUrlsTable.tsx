import { Table } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { UnstyledButton } from '../utils/components/UnstyledButton';
import type { ShortUrlsOrderableFields } from './data';
import { ShortUrlsRow } from './helpers/ShortUrlsRow';
import type { ShortUrlsList as ShortUrlsListState } from './reducers/shortUrlsList';

type ShortUrlsTableProps = {
  orderByColumn?: (column: ShortUrlsOrderableFields) => () => void;
  renderOrderIcon?: (column: ShortUrlsOrderableFields) => ReactNode;
  shortUrlsList: ShortUrlsListState;
  onTagClick?: (tag: string) => void;
};

type ShortUrlsTableBodyProps = Pick<ShortUrlsTableProps, 'shortUrlsList' | 'onTagClick'>;

const FullRow: FC<PropsWithChildren<{ danger?: boolean }>> = ({ children, danger }) => (
  <Table.Row>
    <Table.Cell colSpan={6} className={clsx('text-center', { 'text-danger font-bold': danger })}>
      {children}
    </Table.Cell>
  </Table.Row>
);

const ShortUrlsTableBody: FC<ShortUrlsTableBodyProps> = ({ shortUrlsList, onTagClick }) => {
  const { status } = shortUrlsList;

  if (status === 'error') {
    return <FullRow danger>Something went wrong while loading short URLs :(</FullRow>;
  }

  if (status === 'loading') {
    return <FullRow>Loading...</FullRow>;
  }

  if (status !== 'loaded' || shortUrlsList.shortUrls.data.length === 0) {
    return <FullRow>No results found</FullRow>;
  }

  return shortUrlsList.shortUrls.data.map((shortUrl) => (
    <ShortUrlsRow
      key={shortUrl.shortUrl}
      shortUrl={shortUrl}
      onTagClick={onTagClick}
    />
  ));
};

export const ShortUrlsTable: FC<ShortUrlsTableProps> = (
  { orderByColumn, renderOrderIcon, shortUrlsList, onTagClick },
) => {
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
      <ShortUrlsTableBody shortUrlsList={shortUrlsList} onTagClick={onTagClick} />
    </Table>
  );
};
