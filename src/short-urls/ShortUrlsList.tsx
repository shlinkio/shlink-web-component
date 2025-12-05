import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { determineOrderDir, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import type { ShlinkShortUrlsOrder } from '../api-contract';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSettings } from '../settings';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import { VisitsComparisonCollector } from '../visits/visits-comparison/VisitsComparisonCollector';
import { useVisitsComparison, VisitsComparisonProvider } from '../visits/visits-comparison/VisitsComparisonContext';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from './data';
import { useShortUrlsQuery } from './helpers/hooks';
import { Paginator } from './Paginator';
import { useUrlsList } from './reducers/shortUrlsList';
import { ShortUrlsFilteringBar } from './ShortUrlsFilteringBar';
import { ShortUrlsTable } from './ShortUrlsTable';

const DEFAULT_SHORT_URLS_ORDERING: ShortUrlsOrder = {
  field: 'dateCreated',
  dir: 'DESC',
};

export const ShortUrlsList = boundToMercureHub(() => {
  const { listShortUrls, shortUrlsList } = useUrlsList();
  const { page } = useParams();
  const location = useLocation();
  const [{
    tags,
    tagsMode,
    excludeTags,
    excludeTagsMode,
    search,
    startDate,
    endDate,
    orderBy,
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
  const urlsAreLoaded = shortUrlsList.status === 'loaded';
  const { pagination } = urlsAreLoaded ? shortUrlsList.shortUrls : {};
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
      tagsMode,
      excludeTags,
      excludeTagsMode,
      startDate,
      endDate,
      orderBy: parseOrderByForShlink(actualOrderBy),
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
    excludeTags,
    excludeTagsMode,
  ]);

  return (
    <VisitsComparisonProvider value={visitsComparisonValue}>
      <ShortUrlsFilteringBar
        shortUrlsAmount={urlsAreLoaded ? shortUrlsList.shortUrls.pagination.totalItems : undefined}
        order={actualOrderBy}
        handleOrderBy={handleOrderBy}
        className="mb-4"
      />
      <VisitsComparisonCollector type="short-urls" className="mb-4" />
      <SimpleCard bodyClassName={clsx({ 'pb-0': urlsAreLoaded })}>
        <ShortUrlsTable
          shortUrlsList={shortUrlsList}
          orderByColumn={orderByColumn}
          renderOrderIcon={renderOrderIcon}
          onTagClick={addTag}
        />
        {pagination && <Paginator paginator={pagination} currentQueryString={location.search} />}
      </SimpleCard>
    </VisitsComparisonProvider>

  );
}, () => [Topics.visits]);
