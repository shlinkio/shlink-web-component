import { sortBy, splitEvery, zipObj } from '@shlinkio/data-manipulation';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { SpaceBetweenContainer } from '../../common/SpaceBetweenContainer';
import { PaginationDropdown } from '../../utils/components/PaginationDropdown';
import { SimplePaginator } from '../../utils/components/SimplePaginator';
import { rangeOf } from '../../utils/helpers';
import { roundTen } from '../../utils/helpers/numbers';
import type { Stats, StatsRow } from '../types';
import { ChartCard } from './ChartCard';
import type { HorizontalBarChartProps } from './HorizontalBarChart';
import { HorizontalBarChart } from './HorizontalBarChart';

interface SortableBarChartCardProps extends Omit<HorizontalBarChartProps, 'max' | 'label'> {
  title: string;
  sortingItems: Record<string, string>;
  withPagination?: boolean;
  extraHeaderContent?: (activeCities?: string[]) => ReactNode;
}

const toLowerIfString = (value: any) => (typeof value === 'string' ? value.toLowerCase() : value);
const pickKeyFromPair = ([key]: StatsRow) => key;
const pickValueFromPair = ([, value]: StatsRow) => value;

export const SortableBarChartCard: FC<SortableBarChartCardProps> = ({
  stats,
  prevStats,
  highlightedStats,
  title,
  sortingItems,
  extraHeaderContent,
  withPagination = true,
  ...rest
}) => {
  const [order, setOrder] = useState<Order<string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const getSortedPairsForStats = useCallback((statsToSort: Stats, sorting: Record<string, string>) => {
    const pairs = Object.entries(statsToSort);
    const sortedPairs = !order.field ? pairs : sortBy(
      pairs,
      ([key, value]: StatsRow) => toLowerIfString(order.field === Object.keys(sorting)[0] ? key : value),
    );

    return !order.dir || order.dir === 'ASC' ? sortedPairs : [...sortedPairs].reverse();
  }, [order.dir, order.field]);
  const determineCurrentPagePairs = useCallback((pages: StatsRow[][]): StatsRow[] => {
    const page = pages[currentPage - 1];

    if (currentPage < pages.length) {
      return page;
    }

    const firstPageLength = pages[0].length;

    // Using the "hidden" key, the chart will just replace the label by an empty string
    return [...page, ...rangeOf(firstPageLength - page.length, (i): StatsRow => [`hidden_${i}`, 0])];
  }, [currentPage]);
  const renderPagination = useCallback(
    (pagesCount: number): ReactNode =>
      <SimplePaginator currentPage={currentPage} pagesCount={pagesCount} onPageChange={setCurrentPage} />,
    [currentPage],
  );
  const determineStats = useCallback(
    (statsToSort: Stats, sorting: Record<string, string>, theHighlightedStats?: Stats, thePrevStats?: Stats) => {
      const sortedPairs = getSortedPairsForStats(statsToSort, sorting);
      const sortedKeys = sortedPairs.map(pickKeyFromPair);

      // Highlighted and prev stats have to be ordered based on the regular stats, not on their own values
      const sortedHighlightedPairs = theHighlightedStats && Object.entries(
        { ...zipObj(sortedKeys, sortedKeys.map(() => 0)), ...theHighlightedStats },
      );
      const sortedPrevPairs = thePrevStats && Object.entries(
        { ...zipObj(sortedKeys, sortedKeys.map(() => 0)), ...thePrevStats },
      );

      if (sortedPairs.length <= itemsPerPage) {
        return {
          currentPageStats: Object.fromEntries(sortedPairs),
          currentPageHighlightedStats: sortedHighlightedPairs && Object.fromEntries(sortedHighlightedPairs),
          currentPagePrevStats: sortedPrevPairs && Object.fromEntries(sortedPrevPairs),
        };
      }

      const pages = splitEvery(sortedPairs, itemsPerPage);
      const highlightedPages = sortedHighlightedPairs && splitEvery(sortedHighlightedPairs, itemsPerPage);
      const prevPages = sortedPrevPairs && splitEvery(sortedPrevPairs, itemsPerPage);

      return {
        currentPageStats: Object.fromEntries(determineCurrentPagePairs(pages)),
        currentPageHighlightedStats: highlightedPages && Object.fromEntries(
          determineCurrentPagePairs(highlightedPages),
        ),
        currentPagePrevStats: prevPages && Object.fromEntries(determineCurrentPagePairs(prevPages)),
        pagination: renderPagination(pages.length),
        max: roundTen(Math.max(...sortedPairs.map(pickValueFromPair))),
      };
    },
    [determineCurrentPagePairs, getSortedPairsForStats, itemsPerPage, renderPagination],
  );

  const { currentPageStats, currentPagePrevStats, currentPageHighlightedStats, pagination, max } = useMemo(
    () => determineStats(
      stats,
      sortingItems,
      highlightedStats && Object.keys(highlightedStats).length > 0 ? highlightedStats : undefined,
      prevStats && Object.keys(prevStats).length > 0 ? prevStats : undefined,
    ),
    [determineStats, highlightedStats, prevStats, sortingItems, stats],
  );
  const activeCities = useMemo(() => Object.keys(currentPageStats), [currentPageStats]);

  return (
    <ChartCard
      title={(
        <SpaceBetweenContainer>
          {title}
          <div className="tw:flex tw:items-center">
            {extraHeaderContent?.(pagination ? activeCities : undefined)}
            {withPagination && Object.keys(stats).length > 50 && (
              <PaginationDropdown
                toggleClassName="btn-sm p-0"
                ranges={[50, 100, 200, 500]}
                value={itemsPerPage}
                setValue={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
            <OrderingDropdown
              isButton={false}
              right
              items={sortingItems}
              order={order}
              onChange={(field, dir) => {
                setOrder({ field, dir });
                setCurrentPage(1);
              }}
            />
          </div>
        </SpaceBetweenContainer>
      )}
      footer={pagination}
    >
      <HorizontalBarChart
        stats={currentPageStats}
        prevStats={currentPagePrevStats}
        highlightedStats={currentPageHighlightedStats}
        max={max}
        {...rest}
      />
    </ChartCard>
  );
};
