import type { NumberOrEllipsis } from '@shlinkio/shlink-frontend-kit';
import { Paginator as ShlinkPagination } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useCallback } from 'react';
import type { ShlinkPaginator } from '../api-contract';
import { useRoutesPrefix } from '../utils/routesPrefix';

interface PaginatorProps {
  paginator?: ShlinkPaginator;
  currentQueryString?: string;
}

export const Paginator = ({ paginator, currentQueryString = '' }: PaginatorProps) => {
  const { currentPage = 0, pagesCount = 0 } = paginator ?? {};
  const routesPrefix = useRoutesPrefix();
  const urlForPage = useCallback(
    (pageNumber: NumberOrEllipsis) => `${routesPrefix}/list-short-urls/${pageNumber}${currentQueryString}`,
    [currentQueryString, routesPrefix],
  );

  if (pagesCount <= 1) {
    return <div data-testid="empty-gap" className="pb-4" />; // Return some space
  }

  return (
    <div
      data-testid="short-urls-paginator"
      className={clsx(
        'sticky bottom-0 py-4 -mx-0.5',
        'flex justify-around',
        'bg-lm-primary dark:bg-dm-primary',
        'border-t border-lm-border dark:border-dm-border',
      )}
    >
      <ShlinkPagination urlForPage={urlForPage} currentPage={currentPage} pagesCount={pagesCount} />
    </div>
  );
};
