import { faTag, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { Button, OrderingDropdown, SearchInput, Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { DomainsList } from '../domains/reducers/domainsList';
import { useSetting } from '../settings';
import type { TagsSelectorProps } from '../tags/helpers/TagsSelector';
import type { TagsList } from '../tags/reducers/tagsList';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import { formatIsoDate } from '../utils/dates/helpers/date';
import type { DateInterval, DateRange } from '../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../utils/dates/helpers/dateIntervals';
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
  TagsSelector: FC<TagsSelectorProps>;
};

const ShortUrlsFilteringBar: FCWithDeps<ShortUrlsFilteringConnectProps, ShortUrlsFilteringBarDeps> = (
  { className, shortUrlsAmount, order, handleOrderBy, tagsList, domainsList },
) => {
  const { ExportShortUrlsBtn, TagsSelector } = useDependencies(ShortUrlsFilteringBar);
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
  const changeTagSelection = useCallback((newTags: string[]) => toFirstPage({ tags: newTags }), [toFirstPage]);
  const toggleTagsMode = useCallback(
    () => toFirstPage({ tagsMode: tagsMode === 'any' ? 'all' : 'any' }),
    [tagsMode, toFirstPage],
  );

  const { anchor, tooltip } = useTooltip({ placement: 'left' });

  return (
    <div className={clsx('tw:flex tw:flex-col tw:gap-y-4', className)}>
      <SearchInput defaultValue={search} onChange={setSearch} />

      <div className="tw:flex tw:w-full">
        <div className="tw:flex-grow">
          <TagsSelector
            immutable
            placeholder="With tags..."
            tags={tagsList.tags}
            selectedTags={tags}
            onChange={changeTagSelection}
          />
        </div>
        {tags.length > 1 && (
          <>
            <Button
              variant="secondary"
              onClick={toggleTagsMode}
              aria-label="Change tags mode"
              className="tw:[&]:border-l-none tw:[&]:rounded-l-none"
              {...anchor}
            >
              <FontAwesomeIcon className="tw:text-2xl" icon={tagsMode === 'all' ? faTags : faTag} />
            </Button>
            <Tooltip {...tooltip}>
              {tagsMode === 'all' ? <>With <b>all</b> the tags</> : <>With <b>any</b> of the tags</>}
            </Tooltip>
          </>
        )}
      </div>

      <div className="tw:flex tw:flex-col tw:lg:flex-row-reverse tw:gap-y-4">
        <div className="tw:lg:w-2/3 tw:xl:w-1/2 tw:inline-flex tw:flex-col tw:md:flex-row tw:gap-4">
          <div className="tw:grow">
            <DateRangeSelector
              defaultText="All short URLs"
              dateRangeOrInterval={activeInterval ?? datesToDateRange(startDate, endDate)}
              onDatesChange={setDates}
            />
          </div>
          <ShortUrlsFilterDropdown
            selected={{
              excludeBots: excludeBots ?? visitsSettings?.excludeBots,
              excludeMaxVisitsReached,
              excludePastValidUntil,
              domain,
            }}
            onChange={toFirstPage}
            domains={domainsList.loading ? undefined : domainsList.domains}
          />
        </div>
        <div className="tw:lg:w-1/3 tw:xl:w-1/2 tw:inline-flex tw:gap-3">
          <div className="tw:max-lg:w-1/2 tw:lg:hidden">
            <OrderingDropdown
              containerClassName="tw:[&]:block"
              buttonClassName="tw:w-full"
              prefixed={false}
              items={SHORT_URLS_ORDERABLE_FIELDS}
              order={order}
              onChange={({ field, dir }) => handleOrderBy(field, dir)}
            />
          </div>
          <div className="tw:max-lg:w-1/2">
            <ExportShortUrlsBtn amount={shortUrlsAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShortUrlsFilteringBarFactory = componentFactory(
  ShortUrlsFilteringBar,
  ['ExportShortUrlsBtn', 'TagsSelector'],
);
