import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown, SearchInput } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkTagsFilteringMode } from '@shlinkio/shlink-js-sdk/api-contract';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { DomainFilterDropdown } from '../domains/helpers/DomainFilterDropdown';
import { useDomainsList } from '../domains/reducers/domainsList';
import { useSetting } from '../settings';
import { TagsSearchDropdown } from '../tags/helpers/TagsSearchDropdown';
import { useTagsList } from '../tags/reducers/tagsList';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import { formatIsoDate } from '../utils/dates/helpers/date';
import type { DateInterval, DateRange } from '../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../utils/dates/helpers/dateIntervals';
import { useFeature } from '../utils/features';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from './data';
import { SHORT_URLS_ORDERABLE_FIELDS } from './data';
import { ExportShortUrlsBtn } from './helpers/ExportShortUrlsBtn';
import { useShortUrlsQuery } from './helpers/hooks';
import { ShortUrlsFilterDropdown } from './helpers/ShortUrlsFilterDropdown';

export type ShortUrlsFilteringBarProps = {
  order: ShortUrlsOrder;
  handleOrderBy: (orderField?: ShortUrlsOrderableFields, orderDir?: OrderDir) => void;
  className?: string;
  shortUrlsAmount?: number;
};

export const ShortUrlsFilteringBar: FC<ShortUrlsFilteringBarProps> = (
  { className, shortUrlsAmount, order, handleOrderBy },
) => {
  const { domainsList } = useDomainsList();
  const { tagsList } = useTagsList();
  const [{
    search,
    tags,
    tagsMode = 'any',
    excludeTags,
    excludeTagsMode = 'any',
    startDate,
    endDate,
    excludeBots,
    excludeMaxVisitsReached,
    excludePastValidUntil,
    domain,
  }, toFirstPage] = useShortUrlsQuery();
  const visitsSettings = useSetting('visits');
  const supportsFilterByDomain = useFeature('filterShortUrlsByDomain');
  const supportsFilterByExcludedTags = useFeature('filterShortUrlsByExcludedTags');

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
  const changeTagsMode = useCallback((tagsMode: ShlinkTagsFilteringMode) => toFirstPage({ tagsMode }), [toFirstPage]);
  const changeExcludeTagSelection = useCallback(
    (newTags: string[]) => toFirstPage({ excludeTags: newTags }),
    [toFirstPage],
  );
  const changeExcludeTagsMode = useCallback(
    (excludeTagsMode: ShlinkTagsFilteringMode) => toFirstPage({ excludeTagsMode }),
    [toFirstPage],
  );

  return (
    <div className={clsx('flex flex-col gap-y-4', className)}>
      <SearchInput defaultValue={search} onChange={setSearch} />

      <div className="flex flex-col xl:flex-row-reverse justify-between gap-y-4">
        <div
          className={clsx(
            'flex flex-col lg:flex-row gap-x-2 gap-y-4',
            { 'min-w-3/4': supportsFilterByExcludedTags, 'min-w-2/3': !supportsFilterByExcludedTags },
          )}
        >
          <div className="flex flex-col md:flex-row gap-x-2 gap-y-4 grow">
            <div className="grow">
              <DateRangeSelector
                defaultText="All short URLs"
                dateRangeOrInterval={activeInterval ?? datesToDateRange(startDate, endDate)}
                onDatesChange={setDates}
              />
            </div>
            <div className={clsx('grid lg:flex gap-x-2 gap-y-4', { 'grid-cols-2': supportsFilterByExcludedTags })}>
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
              {supportsFilterByExcludedTags && (
                <TagsSearchDropdown
                  title="Filter by excluded tag"
                  prefix="Without"
                  tags={tagsList.tags}
                  selectedTags={excludeTags}
                  onTagsChange={changeExcludeTagSelection}
                  mode={excludeTagsMode}
                  onModeChange={changeExcludeTagsMode}
                  buttonClassName="w-full"
                />
              )}
            </div>
          </div>
          <div className={clsx('grid lg:flex gap-x-2 gap-y-4', { 'grid-cols-2': supportsFilterByDomain })}>
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
        </div>
        <div className="flex gap-2">
          <div className="max-xl:w-1/2 xl:hidden">
            <OrderingDropdown
              containerClassName="[&]:block"
              buttonClassName="w-full"
              prefixed={false}
              items={SHORT_URLS_ORDERABLE_FIELDS}
              order={order}
              onChange={({ field, dir }) => handleOrderBy(field, dir)}
            />
          </div>
          <div className="max-xl:w-1/2">
            <ExportShortUrlsBtn amount={shortUrlsAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};
