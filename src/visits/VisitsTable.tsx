import { faCheck as checkIcon, faRobot as botIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { mergeDeepRight, splitEvery } from '@shlinkio/data-manipulation';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import {
  determineOrder,
  formatNumber,
  Paginator,
  SearchInput,
  SimpleCard,
  sortList,
  Table,
  Tooltip,
  useTooltip,
} from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import type { VisitsColumn } from '../settings';
import { defaultVisitsListColumns, useSetting } from '../settings';
import { Time } from '../utils/dates/Time';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import type { MediaMatcher } from '../utils/types';
import type { NormalizedOrphanVisit, NormalizedVisit } from './types';

export interface VisitsTableProps {
  visits: NormalizedVisit[];
  selectedVisits?: NormalizedVisit[];
  setSelectedVisits: (visits: NormalizedVisit[]) => void;
  matchMedia?: MediaMatcher;
}

type OrderableFields = VisitsColumn;
type VisitsOrder = Order<OrderableFields>;

const PAGE_SIZE = 20;
const visitMatchesSearch = (
  { browser, os, referer, country, city, userAgent, ...rest }: NormalizedVisit,
  searchTerm: string,
  searchInRawUserAgent: boolean,
) => {
  const userAgentPattern = searchInRawUserAgent ? userAgent : `${country} ${city}`;
  return `${browser} ${os} ${referer} ${userAgentPattern} ${(rest as NormalizedOrphanVisit).visitedUrl}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase());
};
const searchVisits = (searchTerm: string, visits: NormalizedVisit[], searchInRawUserAgent: boolean) =>
  visits.filter((visit) => visitMatchesSearch(visit, searchTerm, searchInRawUserAgent));
const sortVisits = (order: VisitsOrder, visits: NormalizedVisit[]) => sortList<NormalizedVisit>(visits, order as any);

type PaginateVisitsOptions = {
  visits: NormalizedVisit[];
  searchTerm?: string;
  order: VisitsOrder;
  searchInRawUserAgent: boolean;
};

const paginateVisits = ({ visits: allVisits, searchTerm, order, searchInRawUserAgent }: PaginateVisitsOptions) => {
  const filteredVisits = searchTerm ? searchVisits(searchTerm, allVisits, searchInRawUserAgent) : [...allVisits];
  const sortedVisits = sortVisits(order, filteredVisits);
  const total = sortedVisits.length;
  const visitsGroups = splitEvery(sortedVisits, PAGE_SIZE);

  return { visitsGroups, total };
};

const headerCellsClass = 'cursor-pointer md:sticky-cell-separated md:top-[calc(var(--header-height)+41px)]';

const BotIconWithTooltip = () => {
  const { anchor, tooltip } = useTooltip({ placement: 'right' });

  return (
    <>
      <FontAwesomeIcon icon={botIcon} {...anchor} />
      <Tooltip {...tooltip}>
        Potentially a visit from a bot or crawler
      </Tooltip>
    </>
  );
};

export const VisitsTable = ({ visits, selectedVisits = [], setSelectedVisits }: VisitsTableProps) => {
  const [searchTerm, setSearchTerm] = useState<string>();
  const updateSearchTerm = useCallback((newSearchTerm?: string) => {
    setSearchTerm(newSearchTerm);

    // Move to first page and clear selected visits every time the search term changes
    setPage(1);
    setSelectedVisits([]);
  }, [setSelectedVisits]);
  const [order, setOrder] = useState<VisitsOrder>({});
  const visitsListSettings = useSetting('visitsList');
  const columns = useMemo(
    () => mergeDeepRight(
      defaultVisitsListColumns,
      visitsListSettings?.columns ?? {},
    ) as typeof defaultVisitsListColumns,
    [visitsListSettings?.columns],
  );
  const paginator = useMemo(
    () => paginateVisits({ visits, searchTerm, order, searchInRawUserAgent: columns.userAgent }),
    [visits, searchTerm, order, columns.userAgent],
  );
  const [page, setPage] = useState(1);
  const end = page * PAGE_SIZE;
  const start = end - PAGE_SIZE;
  const showVisitedUrl = useMemo(
    () => {
      if (!columns.visitedUrl) {
        return false;
      }

      return paginator.visitsGroups.length === 0 || !!paginator.visitsGroups[page - 1]?.[0]?.visitedUrl;
    },
    [columns.visitedUrl, page, paginator.visitsGroups],
  );
  // TODO Fix this value now that columns can be customized
  const fullSizeColSpan = 6 + Number(showVisitedUrl) + (columns.userAgent ? 1 : 2);
  const hasVisits = paginator.total > 0;

  const orderByColumn = (field: OrderableFields) => setOrder(
    determineOrder({ currentField: order.field, currentOrderDir: order.dir, newField: field }),
  );
  const renderOrderIcon = (field: OrderableFields) =>
    <TableOrderIcon currentOrder={order} field={field} className="float-right mt-[5px] ml-[5px]" />;

  return (
    <SimpleCard
      // Adding a bottom padding to work around the fact that it's not possible to set border radius in internal table
      // elements, and we can also not hide the overflow of the table itself because then sticky elements get hidden
      bodyClassName="[&]:p-0 [&]:pb-1"
      title="Visits list">
      <Table
        responsive={false}
        size="sm"
        className="w-full relative overflow-y-hidden bg-lm-primary dark:bg-dm-primary"
        header={(
          <>
            <Table.Row>
              <Table.Cell
                className={clsx(headerCellsClass, '[&]:text-center')}
                onClick={() => setSelectedVisits(
                  selectedVisits.length < paginator.total ? paginator.visitsGroups.flat() : [],
                )}
              >
                <span className="sr-only">Is selected</span>
                <FontAwesomeIcon
                  icon={checkIcon}
                  className={clsx({ 'text-lm-brand dark:text-dm-brand': selectedVisits.length > 0 })}
                />
              </Table.Cell>
              {columns.potentialBot && (
                <Table.Cell
                  className={clsx(headerCellsClass, '[&]:text-center')}
                  onClick={() => orderByColumn('potentialBot')}
                >
                  <span className="sr-only">Is bot</span>
                  <FontAwesomeIcon icon={botIcon} />
                  {renderOrderIcon('potentialBot')}
                </Table.Cell>
              )}
              {columns.date && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('date')}>
                  Date
                  {renderOrderIcon('date')}
                </Table.Cell>
              )}
              {columns.country && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('country')}>
                  Country
                  {renderOrderIcon('country')}
                </Table.Cell>
              )}
              {columns.region && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('region')}>
                  Region
                  {renderOrderIcon('region')}
                </Table.Cell>
              )}
              {columns.city && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('city')}>
                  City
                  {renderOrderIcon('city')}
                </Table.Cell>
              )}
              {columns.userAgent && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('userAgent')}>
                  User agent
                  {renderOrderIcon('userAgent')}
                </Table.Cell>
              )}
              {columns.browser && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('browser')}>
                  Browser
                  {renderOrderIcon('browser')}
                </Table.Cell>
              )}
              {columns.browser && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('os')}>
                  OS
                  {renderOrderIcon('os')}
                </Table.Cell>
              )}
              {columns.referer && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('referer')}>
                  Referrer
                  {renderOrderIcon('referer')}
                </Table.Cell>
              )}
              {showVisitedUrl && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('visitedUrl')}>
                  Visited URL
                  {renderOrderIcon('visitedUrl')}
                </Table.Cell>
              )}
            </Table.Row>
            <Table.Row>
              <Table.Cell colSpan={fullSizeColSpan} className="[&]:p-0">
                <SearchInput size="md" borderless onChange={updateSearchTerm} />
              </Table.Cell>
            </Table.Row>
          </>
        )}
        footer={paginator.total > PAGE_SIZE ? (
          <Table.Row>
            <Table.Cell type="td" colSpan={fullSizeColSpan} className="md:sticky-cell-separated bottom-0">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-1">
                <Paginator
                  pagesCount={Math.ceil(paginator.total / PAGE_SIZE)}
                  currentPage={page}
                  onPageChange={setPage}
                />
                <div>
                  Visits <b>{formatNumber(start + 1)}</b> to{' '}
                  <b>{formatNumber(Math.min(end, paginator.total))}</b> of{' '}
                  <b>{formatNumber(paginator.total)}</b>
                </div>
              </div>
            </Table.Cell>
          </Table.Row>
        ) : undefined}
      >
        {!hasVisits && (
          <Table.Row>
            <Table.Cell colSpan={fullSizeColSpan} className="text-center">
              There are no visits matching current filter
            </Table.Cell>
          </Table.Row>
        )}

        {paginator.visitsGroups[page - 1]?.map((visit, index) => {
          const isSelected = selectedVisits.includes(visit);
          return (
            <Table.Row
              key={index}
              className={clsx('cursor-pointer', isSelected && [
                'bg-lm-table-highlight hover:[&]:bg-lm-table-highlight',
                'dark:bg-dm-table-highlight dark:hover:[&]:bg-dm-table-highlight',
              ])}
              onClick={() => setSelectedVisits(
                isSelected ? selectedVisits.filter((v) => v !== visit) : [...selectedVisits, visit],
              )}
            >
              <Table.Cell className="text-center">
                {isSelected && <FontAwesomeIcon icon={checkIcon} className="text-lm-brand dark:text-dm-brand" />}
              </Table.Cell>
              {columns.potentialBot && (
                <Table.Cell className="text-center">
                  {visit.potentialBot && <BotIconWithTooltip />}
                </Table.Cell>
              )}
              {columns.date && <Table.Cell><Time date={visit.date} /></Table.Cell>}
              {columns.country && <Table.Cell>{visit.country}</Table.Cell>}
              {columns.region && <Table.Cell>{visit.region}</Table.Cell>}
              {columns.city && <Table.Cell>{visit.city}</Table.Cell>}
              {columns.userAgent && <Table.Cell>{visit.userAgent}</Table.Cell>}
              {columns.browser && <Table.Cell>{visit.browser}</Table.Cell>}
              {columns.os && <Table.Cell>{visit.os}</Table.Cell>}
              {columns.referer && <Table.Cell>{visit.referer}</Table.Cell>}
              {showVisitedUrl && <Table.Cell>{visit.visitedUrl ?? ''}</Table.Cell>}
            </Table.Row>
          );
        })}
      </Table>
    </SimpleCard>
  );
};
