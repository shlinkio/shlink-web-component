import { sortBy, splitEvery, zipObj } from '@shlinkio/data-manipulation';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { PaginationDropdown } from '../../utils/components/PaginationDropdown';
import { SimplePaginator } from '../../utils/components/SimplePaginator';
import { rangeOf } from '../../utils/helpers';
import { roundTen } from '../../utils/helpers/numbers';
import type { HorizontalBarChartProps } from '../recharts/HorizontalBarChart';
import { HorizontalBarChart } from '../recharts/HorizontalBarChart';
import type { Stats, StatsRow } from '../types';
import { ChartCard } from './ChartCard';

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

  const getSortedPairsForStats = (statsToSort: Stats, sorting: Record<string, string>) => {
    const pairs = Object.entries(statsToSort);
    const sortedPairs = !order.field ? pairs : sortBy(
      pairs,
      ([key, value]: StatsRow) => toLowerIfString(order.field === Object.keys(sorting)[0] ? key : value),
    );

    return !order.dir || order.dir === 'ASC' ? sortedPairs : [...sortedPairs].reverse();
  };
  const determineCurrentPagePairs = (pages: StatsRow[][]): StatsRow[] => {
    const page = pages[currentPage - 1];

    if (currentPage < pages.length) {
      return page;
    }

    const firstPageLength = pages[0].length;

    // Using the "hidden" key, the chart will just replace the label by an empty string
    return [...page, ...rangeOf(firstPageLength - page.length, (i): StatsRow => [`hidden_${i}`, 0])];
  };
  const renderPagination = (pagesCount: number): ReactNode =>
    <SimplePaginator currentPage={currentPage} pagesCount={pagesCount} setCurrentPage={setCurrentPage} />;
  const determineStats = (statsToSort: Stats, sorting: Record<string, string>, theHighlightedStats?: Stats) => {
    const sortedPairs = getSortedPairsForStats(statsToSort, sorting);
    const sortedKeys = sortedPairs.map(pickKeyFromPair);
    // The highlighted stats have to be ordered based on the regular stats, not on its own values
    const sortedHighlightedPairs = theHighlightedStats && Object.entries(
      { ...zipObj(sortedKeys, sortedKeys.map(() => 0)), ...theHighlightedStats },
    );

    if (sortedPairs.length <= itemsPerPage) {
      return {
        currentPageStats: Object.fromEntries(sortedPairs),
        currentPageHighlightedStats: sortedHighlightedPairs && Object.fromEntries(sortedHighlightedPairs),
      };
    }

    const pages = splitEvery(sortedPairs, itemsPerPage);
    const highlightedPages = sortedHighlightedPairs && splitEvery(sortedHighlightedPairs, itemsPerPage);

    return {
      currentPageStats: Object.fromEntries(determineCurrentPagePairs(pages)),
      currentPageHighlightedStats: highlightedPages && Object.fromEntries(determineCurrentPagePairs(highlightedPages)),
      pagination: renderPagination(pages.length),
      max: roundTen(Math.max(...sortedPairs.map(pickValueFromPair))),
    };
  };

  const { currentPageStats, currentPageHighlightedStats, pagination, max } = determineStats(
    stats,
    sortingItems,
    highlightedStats && Object.keys(highlightedStats).length > 0 ? highlightedStats : undefined,
  );
  const activeCities = Object.keys(currentPageStats);

  return (
    <ChartCard
      title={(
        <>
          {title}
          <div className="float-end">
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
          {withPagination && Object.keys(stats).length > 50 && (
            <div className="float-end">
              <PaginationDropdown
                toggleClassName="btn-sm p-0 me-3"
                ranges={[50, 100, 200, 500]}
                value={itemsPerPage}
                setValue={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
          {extraHeaderContent && (
            <div className="float-end">
              {extraHeaderContent(pagination ? activeCities : undefined)}
            </div>
          )}
        </>
      )}
      footer={pagination}
    >
      <HorizontalBarChart
        stats={currentPageStats}
        highlightedStats={currentPageHighlightedStats}
        max={max}
        {...rest}
      />
    </ChartCard>
  );
};
