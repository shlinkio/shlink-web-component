import { faTag, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown } from '@shlinkio/shlink-frontend-kit';
import { Button, SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { InputGroup, Row, UncontrolledTooltip } from 'reactstrap';
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

  return (
    <div className={clsx('tw:flex tw:flex-col tw:gap-y-4', className)}>
      <SearchInput defaultValue={search} onChange={setSearch} />

      <InputGroup>
        <TagsSelector
          immutable
          placeholder="With tags..."
          tags={tagsList.tags}
          selectedTags={tags}
          onChange={changeTagSelection}
        />
        {tags.length > 1 && (
          <>
            <Button
              variant="secondary"
              onClick={toggleTagsMode}
              id="tagsModeBtn"
              aria-label="Change tags mode"
              className="tw:[&]:border-l-none tw:[&]:rounded-l-none"
            >
              <FontAwesomeIcon className="tw:text-2xl" icon={tagsMode === 'all' ? faTags : faTag} />
            </Button>
            <UncontrolledTooltip target="tagsModeBtn" placement="left">
              {tagsMode === 'all' ? 'With all the tags.' : 'With any of the tags.'}
            </UncontrolledTooltip>
          </>
        )}
      </InputGroup>

      <Row className="tw:lg:flex-row-reverse">
        <div className="col-lg-8 col-xl-6">
          <div className="d-md-flex">
            <div className="flex-grow-1">
              <DateRangeSelector
                defaultText="All short URLs"
                dateRangeOrInterval={activeInterval ?? datesToDateRange(startDate, endDate)}
                onDatesChange={setDates}
              />
            </div>
            <ShortUrlsFilterDropdown
              className="ms-0 ms-md-2"
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
        </div>
        <div className="col-6 col-lg-4 col-xl-6">
          <ExportShortUrlsBtn amount={shortUrlsAmount} />
        </div>
        <div className="col-6 d-lg-none">
          <OrderingDropdown
            prefixed={false}
            items={SHORT_URLS_ORDERABLE_FIELDS}
            order={order}
            onChange={handleOrderBy}
          />
        </div>
      </Row>
    </div>
  );
};

export const ShortUrlsFilteringBarFactory = componentFactory(
  ShortUrlsFilteringBar,
  ['ExportShortUrlsBtn', 'TagsSelector'],
);
