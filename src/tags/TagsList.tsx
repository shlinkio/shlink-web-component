import {
  determineOrderDir,
  Message,
  OrderingDropdown,
  Result,
  SearchField,
  sortList,
} from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Row } from 'reactstrap';
import { ShlinkApiError } from '../common/ShlinkApiError';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSettings } from '../utils/settings';
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
      <Result type="error">
        <ShlinkApiError errorData={tagsList.errorData} fallbackMessage="Error loading tags :(" />
      </Result>
    );
  }

  const orderByColumn = (field: TagsOrderableFields) => () => {
    const dir = determineOrderDir(field, order.field, order.dir);
    setOrder({ field: dir ? field : undefined, dir });
  };

  return (
    <VisitsComparisonProvider value={visitsComparison}>
      <SearchField className="mb-3" onChange={filterTags} />
      <Row className="mb-3">
        <div className="col-lg-6 offset-lg-6">
          <OrderingDropdown
            items={TAGS_ORDERABLE_FIELDS}
            order={order}
            onChange={(field, dir) => setOrder({ field, dir })}
          />
        </div>
      </Row>
      <VisitsComparisonCollector type="tags" className="mb-3" />
      <TagsTable
        sortedTags={sortedTags}
        currentOrder={order}
        orderByColumn={orderByColumn}
      />
    </VisitsComparisonProvider>
  );
}, () => [Topics.visits]);

export const TagsListFactory = componentFactory(TagsList, ['TagsTable']);
