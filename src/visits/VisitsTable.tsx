import { faCheck as checkIcon, faRobot as botIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { splitEvery } from '@shlinkio/data-manipulation';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { determineOrderDir, sortList, useToggle } from '@shlinkio/shlink-frontend-kit';
import {
  formatNumber,
  Label,
  Paginator,
  SearchInput,
  SimpleCard,
  Table,
  ToggleSwitch,
} from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
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

type OrderableFields = 'date' | 'country' | 'city' | 'browser' | 'os' | 'referer' | 'userAgent' | 'visitedUrl' | 'potentialBot';
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

const headerCellsClass = 'tw:cursor-pointer tw:md:sticky-cell-separated tw:md:top-[calc(var(--header-height)+41px)]';

export const VisitsTable = ({ visits, selectedVisits = [], setSelectedVisits }: VisitsTableProps) => {
  const [searchTerm, setSearchTerm] = useState<string>();
  const updateSearchTerm = useCallback((newSearchTerm?: string) => {
    setSearchTerm(newSearchTerm);

    // Move to first page and clear selected visits every time the search term changes
    setPage(1);
    setSelectedVisits([]);
  }, [setSelectedVisits]);
  const [order, setOrder] = useState<VisitsOrder>({});
  const { flag: showUserAgent, toggle: toggleShowUserAgent } = useToggle(false, true);
  const toggleUserAgentAndResetOrder = useCallback(() => {
    toggleShowUserAgent();
    setOrder({});
  }, [toggleShowUserAgent]);
  const paginator = useMemo(
    () => paginateVisits({ visits, searchTerm, order, searchInRawUserAgent: showUserAgent }),
    [visits, searchTerm, order, showUserAgent],
  );
  const [page, setPage] = useState(1);
  const end = page * PAGE_SIZE;
  const start = end - PAGE_SIZE;
  const showVisitedUrl = useMemo(
    () => !!paginator.visitsGroups[page - 1]?.[0]?.visitedUrl,
    [page, paginator.visitsGroups],
  );
  const fullSizeColSpan = 6 + Number(showVisitedUrl) + (showUserAgent ? 1 : 2);
  const hasVisits = paginator.total > 0;

  const orderByColumn = (field: OrderableFields) => setOrder(
    { field, dir: determineOrderDir(field, order.field, order.dir) },
  );
  const renderOrderIcon = (field: OrderableFields) =>
    <TableOrderIcon currentOrder={order} field={field} className="tw:float-right tw:mt-[5px] tw:ml-[5px]" />;

  return (
    <SimpleCard
      // Adding a bottom padding to work around the fact that it's not possible to set border radius in internal table
      // elements, and we can also not hide the overflow of the table itself because then sticky elements get hidden
      bodyClassName="tw:[&]:p-0 tw:[&]:pb-1"
      title={
        <span className="tw:flex tw:justify-between tw:items-center tw:text-base">
          Visits list
          <Label className="tw:flex tw:items-center tw:gap-2">
            <ToggleSwitch checked={showUserAgent} onChange={toggleUserAgentAndResetOrder} />
            Show user agent
          </Label>
        </span>
      }>
      <Table
        responsive={false}
        size="sm"
        className="tw:w-full tw:relative tw:overflow-y-hidden tw:bg-lm-primary tw:dark:bg-dm-primary"
        header={(
          <>
            <Table.Row>
              <Table.Cell
                className={clsx(headerCellsClass, 'tw:text-center')}
                onClick={() => setSelectedVisits(
                  selectedVisits.length < paginator.total ? paginator.visitsGroups.flat() : [],
                )}
              >
                <span className="tw:sr-only">Is selected</span>
                <FontAwesomeIcon
                  icon={checkIcon}
                  className={clsx({ 'tw:text-lm-brand tw:dark:text-dm-brand': selectedVisits.length > 0 })}
                />
              </Table.Cell>
              <Table.Cell
                className={clsx(headerCellsClass, 'tw:text-center')}
                onClick={() => orderByColumn('potentialBot')}
              >
                <span className="tw:sr-only">Is bot</span>
                <FontAwesomeIcon icon={botIcon} />
                {renderOrderIcon('potentialBot')}
              </Table.Cell>
              <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('date')}>
                Date
                {renderOrderIcon('date')}
              </Table.Cell>
              <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('country')}>
                Country
                {renderOrderIcon('country')}
              </Table.Cell>
              <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('city')}>
                City
                {renderOrderIcon('city')}
              </Table.Cell>
              {showUserAgent ? (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('userAgent')}>
                  User agent
                  {renderOrderIcon('userAgent')}
                </Table.Cell>
              ) : (
                <>
                  <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('browser')}>
                    Browser
                    {renderOrderIcon('browser')}
                  </Table.Cell>
                  <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('os')}>
                    OS
                    {renderOrderIcon('os')}
                  </Table.Cell>
                </>
              )}
              <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('referer')}>
                Referrer
                {renderOrderIcon('referer')}
              </Table.Cell>
              {showVisitedUrl && (
                <Table.Cell className={headerCellsClass} onClick={() => orderByColumn('visitedUrl')}>
                  Visited URL
                  {renderOrderIcon('visitedUrl')}
                </Table.Cell>
              )}
            </Table.Row>
            <Table.Row>
              <Table.Cell colSpan={fullSizeColSpan} className="tw:[&]:p-0">
                <SearchInput size="md" borderless onChange={updateSearchTerm} />
              </Table.Cell>
            </Table.Row>
          </>
        )}
        footer={paginator.total > PAGE_SIZE ? (
          <Table.Row>
            <Table.Cell type="td" colSpan={fullSizeColSpan} className="tw:md:sticky-cell-separated tw:bottom-0">
              <div className="tw:flex tw:flex-col tw:md:flex-row tw:justify-between tw:items-center tw:gap-4 tw:p-1">
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
            <Table.Cell colSpan={fullSizeColSpan} className="tw:text-center">
              There are no visits matching current filter
            </Table.Cell>
          </Table.Row>
        )}

        {paginator.visitsGroups[page - 1]?.map((visit, index) => {
          const isSelected = selectedVisits.includes(visit);
          return (
            <Table.Row
              key={index}
              className={clsx('tw:cursor-pointer', isSelected && [
                'tw:bg-lm-table-highlight tw:hover:[&]:bg-lm-table-highlight',
                'tw:dark:bg-dm-table-highlight tw:dark:hover:[&]:bg-dm-table-highlight',
              ])}
              onClick={() => setSelectedVisits(
                isSelected ? selectedVisits.filter((v) => v !== visit) : [...selectedVisits, visit],
              )}
            >
              <Table.Cell className="tw:text-center">
                {isSelected && <FontAwesomeIcon icon={checkIcon} className="tw:text-lm-brand tw:dark:text-dm-brand" />}
              </Table.Cell>
              <Table.Cell className="tw:text-center">
                {visit.potentialBot && (
                  <>
                    <FontAwesomeIcon icon={botIcon} id={`botIcon${index}`} />
                    <UncontrolledTooltip placement="right" target={`botIcon${index}`}>
                      Potentially a visit from a bot or crawler
                    </UncontrolledTooltip>
                  </>
                )}
              </Table.Cell>
              <Table.Cell><Time date={visit.date} /></Table.Cell>
              <Table.Cell>{visit.country}</Table.Cell>
              <Table.Cell>{visit.city}</Table.Cell>
              {showUserAgent ? (
                <Table.Cell>{visit.userAgent}</Table.Cell>
              ) : (
                <>
                  <Table.Cell>{visit.browser}</Table.Cell>
                  <Table.Cell>{visit.os}</Table.Cell>
                </>
              )}
              <Table.Cell>{visit.referer}</Table.Cell>
              {showVisitedUrl && <Table.Cell>{visit.visitedUrl ?? ''}</Table.Cell>}
            </Table.Row>
          );
        })}
      </Table>
    </SimpleCard>
  );
};
