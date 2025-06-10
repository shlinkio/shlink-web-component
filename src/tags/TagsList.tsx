import { determineOrder, sortList } from '@shlinkio/shlink-frontend-kit';
import { Message, OrderingDropdown, Result, SearchInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { ShlinkApiError } from '../common/ShlinkApiError';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSettings } from '../settings';
import { VisitsComparisonCollector } from '../visits/visits-comparison/VisitsComparisonCollector';
import { useVisitsComparison, VisitsComparisonProvider } from '../visits/visits-comparison/VisitsComparisonContext';
import type { SimplifiedTag } from './data';
import type { TagsOrder, TagsOrderableFields } from './data/TagsListChildrenProps';
import { TAGS_ORDERABLE_FIELDS } from './data/TagsListChildrenProps';
import type { TagsList as TagsListState } from './reducers/tagsList';
import type { TagsTableProps } from './TagsTable';

export type TagsListProps = {
  filterTags: (searchTerm: string) => void;
  tagsList: TagsListState;
};

type TagsListActualProps = MercureBoundProps & TagsListProps;

type TagsListDeps = {
  TagsTable: FC<TagsTableProps>;
};

const TagsList: FCWithDeps<TagsListActualProps, TagsListDeps> = boundToMercureHub(({ filterTags, tagsList }) => {
  const { TagsTable } = useDependencies(TagsList);
  const settings = useSettings();
  const [order, setOrder] = useState<TagsOrder>(settings.tags?.defaultOrdering ?? {});
  const sortedTags = useMemo(() => {
    const simplifiedTags = tagsList.filteredTags.map((tag): SimplifiedTag => {
      const theTag = tagsList.stats[tag];
      const visits = (
        settings.visits?.excludeBots ? theTag?.visitsSummary?.nonBots : theTag?.visitsSummary?.total
      ) ?? theTag?.visitsCount ?? 0;

      return {
        tag,
        visits,
        shortUrls: theTag?.shortUrlsCount ?? 0,
      };
    });
    return sortList<SimplifiedTag>(simplifiedTags, order);
  }, [order, settings.visits?.excludeBots, tagsList.filteredTags, tagsList.stats]);
  const visitsComparison = useVisitsComparison();

  if (tagsList.loading) {
    return <Message loading />;
  }

  if (tagsList.error) {
    return (
      <Result variant="error">
        <ShlinkApiError errorData={tagsList.errorData} fallbackMessage="Error loading tags :(" />
      </Result>
    );
  }

  const orderByColumn = (field: TagsOrderableFields) => () =>
    setOrder(determineOrder({ currentField: order.field, currentOrderDir: order.dir, newField: field }));

  return (
    <VisitsComparisonProvider value={visitsComparison}>
      <div className="tw:flex tw:flex-col tw:gap-4">
        <SearchInput onChange={filterTags} />
        <div className="tw:flex tw:flex-col tw:lg:flex-row tw:lg:justify-end">
          <div className="tw:lg:w-1/2">
            <OrderingDropdown
              containerClassName="tw:[&]:block"
              buttonClassName="tw:w-full"
              items={TAGS_ORDERABLE_FIELDS}
              order={order}
              onChange={setOrder}
            />
          </div>
        </div>
        <VisitsComparisonCollector type="tags" />
        <TagsTable
          sortedTags={sortedTags}
          currentOrder={order}
          orderByColumn={orderByColumn}
        />
      </div>
    </VisitsComparisonProvider>
  );
}, () => [Topics.visits]);

export const TagsListFactory = componentFactory(TagsList, ['TagsTable']);
