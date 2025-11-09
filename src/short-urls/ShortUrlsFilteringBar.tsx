import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown, SearchInput } from '@shlinkio/shlink-frontend-kit';
import type { TagsFilteringMode } from '@shlinkio/shlink-js-sdk/api-contract';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { DomainFilterDropdown } from '../domains/helpers/DomainFilterDropdown';
import type { DomainsList } from '../domains/reducers/domainsList';
import { useSetting } from '../settings';
import type { TagsSearchDropdownProps } from '../tags/helpers/TagsSearchDropdown';
import type { TagsList } from '../tags/reducers/tagsList';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import { formatIsoDate } from '../utils/dates/helpers/date';
import type { DateInterval, DateRange } from '../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../utils/dates/helpers/dateIntervals';
import { useFeature } from '../utils/features';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from './data';
import { SHORT_URLS_ORDERABLE_FIELDS } from './data';
import type { ExportShortUrlsBtnProps } from './helpers/ExportShortUrlsBtn';
import { useShortUrlsQuery } from './helpers/hooks';
import { ShortUrlsFilterDropdown } from './helpers/ShortUrlsFilterDropdown';

export type ShortUrlsFilteringBarProps = {
  order: ShortUrlsOrder;
  handleOrderBy: (orderField?: ShortUrlsOrderableFields, orderDir?: OrderDir) => void;
  className?: string;
  shortUrlsAmount?: number;
};

type ShortUrlsFilteringConnectProps = ShortUrlsFilteringBarProps & {
  tagsList: TagsList;
  domainsList: DomainsList;
};

type ShortUrlsFilteringBarDeps = {
  ExportShortUrlsBtn: FC<ExportShortUrlsBtnProps>;
  TagsSearchDropdown: FC<TagsSearchDropdownProps>;
};

const ShortUrlsFilteringBar: FCWithDeps<ShortUrlsFilteringConnectProps, ShortUrlsFilteringBarDeps> = (
  { className, shortUrlsAmount, order, handleOrderBy, tagsList, domainsList },
) => {
  const { ExportShortUrlsBtn, TagsSearchDropdown } = useDependencies(ShortUrlsFilteringBar);
  const [{
    search,
    tags,
    startDate,
    endDate,
    excludeBots,
    excludeMaxVisitsReached,
    excludePastValidUntil,
    domain,
    tagsMode = 'any',
  }, toFirstPage] = useShortUrlsQuery();
  const visitsSettings = useSetting('visits');
  const supportsFilterByDomain = useFeature('filterShortUrlsByDomain');

  const [activeInterval, setActiveInterval] = useState<DateInterval>();
  const setDates = useCallback(
    ({ startDate: newStartDate, endDate: newEndDate }: DateRange, newDateInterval?: DateInterval) => {
      toFirstPage({
        startDate: formatIsoDate(newStartDate) ?? undefined,
        endDate: formatIsoDate(newEndDate) ?? undefined,
      });
      setActiveInterval(newDateInterval);
    },
    [toFirstPage],
  );
  const setSearch = useCallback(
    (searchTerm: string) => toFirstPage({ search: !searchTerm ? undefined : searchTerm }),
    [toFirstPage],
  );
  const setDomain = useCallback((domain?: string) => toFirstPage({ domain }), [toFirstPage]);
  const changeTagSelection = useCallback((newTags: string[]) => toFirstPage({ tags: newTags }), [toFirstPage]);
  const changeTagsMode = useCallback((tagsMode: TagsFilteringMode) => toFirstPage({ tagsMode }), [toFirstPage]);

  return (
    <div className={clsx('flex flex-col gap-y-4', className)}>
      <SearchInput defaultValue={search} onChange={setSearch} />

      <div className="flex flex-col lg:flex-row-reverse gap-y-4">
        <div className="lg:w-2/3 inline-flex flex-col md:flex-row gap-x-2 gap-y-4">
          <div className="grow">
            <DateRangeSelector
              defaultText="All short URLs"
              dateRangeOrInterval={activeInterval ?? datesToDateRange(startDate, endDate)}
              onDatesChange={setDates}
            />
          </div>
          <TagsSearchDropdown
            title="Filter by tag"
            prefix="With"
            tags={tagsList.tags}
            selectedTags={tags}
            onTagsChange={changeTagSelection}
            mode={tagsMode}
            onModeChange={changeTagsMode}
            buttonClassName="w-full"
          />
          {supportsFilterByDomain && (
            <DomainFilterDropdown domains={domainsList.domains} onChange={setDomain} value={domain} />
          )}
          <ShortUrlsFilterDropdown
            selected={{
              excludeBots: excludeBots ?? visitsSettings?.excludeBots,
              excludeMaxVisitsReached,
              excludePastValidUntil,
            }}
            onChange={toFirstPage}
          />
        </div>
        <div className="lg:w-1/3 inline-flex gap-3">
          <div className="max-lg:w-1/2 lg:hidden">
            <OrderingDropdown
              containerClassName="[&]:block"
              buttonClassName="w-full"
              prefixed={false}
              items={SHORT_URLS_ORDERABLE_FIELDS}
              order={order}
              onChange={({ field, dir }) => handleOrderBy(field, dir)}
            />
          </div>
          <div className="max-lg:w-1/2">
            <ExportShortUrlsBtn amount={shortUrlsAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShortUrlsFilteringBarFactory = componentFactory(
  ShortUrlsFilteringBar,
  ['ExportShortUrlsBtn', 'TagsSearchDropdown'],
);
