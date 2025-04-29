import type { NumberOrEllipsis } from '@shlinkio/shlink-frontend-kit/tailwind';
import { Paginator as ShlinkPagination } from '@shlinkio/shlink-frontend-kit/tailwind';
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
    return <div data-testid="empty-gap" className="tw:pb-4" />; // Return some space
  }

  return (
    <div
      data-testid="short-urls-paginator"
      className={clsx(
        'tw:sticky tw:bottom-0 tw:py-4 tw:-mx-0.5',
        'tw:flex tw:justify-around',
        'tw:bg-lm-primary tw:dark:bg-dm-primary',
        'tw:border-t tw:border-lm-border tw:dark:border-dm-border',
      )}
    >
      <ShlinkPagination urlForPage={urlForPage} currentPage={currentPage} pagesCount={pagesCount} />
    </div>
  );
};
