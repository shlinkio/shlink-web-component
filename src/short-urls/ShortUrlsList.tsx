import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { determineOrderDir , SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import type { ShlinkShortUrlsListParams, ShlinkShortUrlsOrder } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSettings } from '../settings';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import { VisitsComparisonCollector } from '../visits/visits-comparison/VisitsComparisonCollector';
import {
  useVisitsComparison,
  VisitsComparisonProvider,
} from '../visits/visits-comparison/VisitsComparisonContext';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from './data';
import { useShortUrlsQuery } from './helpers/hooks';
import { Paginator } from './Paginator';
import type { ShortUrlsList as ShortUrlsListState } from './reducers/shortUrlsList';
import type { ShortUrlsFilteringBarProps } from './ShortUrlsFilteringBar';
import type { ShortUrlsTableType } from './ShortUrlsTable';

type ShortUrlsListProps = MercureBoundProps & {
  shortUrlsList: ShortUrlsListState;
  listShortUrls: (params: ShlinkShortUrlsListParams) => void;
};

type ShortUrlsListDeps = {
  ShortUrlsTable: ShortUrlsTableType,
  ShortUrlsFilteringBar: FC<ShortUrlsFilteringBarProps>,
};

const DEFAULT_SHORT_URLS_ORDERING: ShortUrlsOrder = {
  field: 'dateCreated',
  dir: 'DESC',
};

const ShortUrlsList: FCWithDeps<ShortUrlsListProps, ShortUrlsListDeps> = boundToMercureHub((
  { listShortUrls, shortUrlsList },
) => {
  const { ShortUrlsTable, ShortUrlsFilteringBar } = useDependencies(ShortUrlsList);
  const { page } = useParams();
  const location = useLocation();
  const [{
    tags,
    search,
    startDate,
    endDate,
    orderBy,
    tagsMode,
    excludeBots,
    excludePastValidUntil,
    excludeMaxVisitsReached,
    domain,
  }, toFirstPage] = useShortUrlsQuery();
  const settings = useSettings();
  const [actualOrderBy, setActualOrderBy] = useState(
    // This separated state handling is needed to be able to fall back to settings value, but only once when loaded
    orderBy ?? settings.shortUrlsList?.defaultOrdering ?? DEFAULT_SHORT_URLS_ORDERING,
  );
  const { pagination } = shortUrlsList?.shortUrls ?? {};
  const doExcludeBots = useMemo(
    () => excludeBots ?? settings.visits?.excludeBots,
    [excludeBots, settings.visits?.excludeBots],
  );
  const handleOrderBy = useCallback((field?: ShortUrlsOrderableFields, dir?: OrderDir) => {
    toFirstPage({ orderBy: { field, dir } });
    setActualOrderBy({ field, dir });
  }, [toFirstPage]);
  const orderByColumn = (field: ShortUrlsOrderableFields) => () => handleOrderBy(
    field,
    determineOrderDir({ currentOrderDir: actualOrderBy.dir, currentField: actualOrderBy.field, newField: field }),
  );
  const renderOrderIcon = (field: ShortUrlsOrderableFields) =>
    <TableOrderIcon currentOrder={actualOrderBy} field={field} />;
  const addTag = useCallback(
    (newTag: string) => toFirstPage({ tags: [...new Set([...tags, newTag])] }),
    [tags, toFirstPage],
  );
  const parseOrderByForShlink = useCallback(({ field, dir }: ShortUrlsOrder): ShlinkShortUrlsOrder => {
    if (doExcludeBots && field === 'visits') {
      return { field: 'nonBotVisits', dir };
    }

    return { field, dir };
  }, [doExcludeBots]);
  const visitsComparisonValue = useVisitsComparison();

  useEffect(() => {
    listShortUrls({
      page,
      searchTerm: search,
      tags,
      startDate,
      endDate,
      orderBy: parseOrderByForShlink(actualOrderBy),
      tagsMode,
      excludePastValidUntil,
      excludeMaxVisitsReached,
      domain,
    });
  }, [
    listShortUrls,
    parseOrderByForShlink,
    page,
    search,
    tags,
    startDate,
    endDate,
    actualOrderBy,
    tagsMode,
    excludePastValidUntil,
    excludeMaxVisitsReached,
    domain,
  ]);

  return (
    <VisitsComparisonProvider value={visitsComparisonValue}>
      <ShortUrlsFilteringBar
        shortUrlsAmount={shortUrlsList.shortUrls?.pagination.totalItems}
        order={actualOrderBy}
        handleOrderBy={handleOrderBy}
        className="mb-4"
      />
      <VisitsComparisonCollector type="short-urls" className="mb-4" />
      <SimpleCard bodyClassName={clsx({ 'pb-0': !shortUrlsList.loading })}>
        <ShortUrlsTable
          shortUrlsList={shortUrlsList}
          orderByColumn={orderByColumn}
          renderOrderIcon={renderOrderIcon}
          onTagClick={addTag}
        />
        {!shortUrlsList.loading && <Paginator paginator={pagination} currentQueryString={location.search} />}
      </SimpleCard>
    </VisitsComparisonProvider>

  );
}, () => [Topics.visits]);

export const ShortUrlsListFactory = componentFactory(ShortUrlsList, ['ShortUrlsTable', 'ShortUrlsFilteringBar']);
