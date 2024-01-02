import { useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect } from 'react';
import type { LoadTagVisitsForComparison } from './reducers/tagVisitsComparison';
import type { VisitsComparisonInfo } from './reducers/types';

type TagVisitsComparisonProps = {
  getTagVisitsForComparison: (params: LoadTagVisitsForComparison) => void;
  tagVisitsComparison: VisitsComparisonInfo;
  cancelGetTagVisitsComparison: () => void;
};

// TODO
//      * Bind to mercure for visits creation
//      * Inject ColorGenerator so that chart lines use the tag color
/* v8 ignore start */
export const TagVisitsComparison: FC<TagVisitsComparisonProps> = (
  { getTagVisitsForComparison, tagVisitsComparison },
) => {
  const { tags } = useParsedQuery<{ tags: string }>();
  const { visitsGroups, loading } = tagVisitsComparison;

  useEffect(() => {
    getTagVisitsForComparison({ tags: tags.split(',') });
  }, [getTagVisitsForComparison, tags]);

  if (loading) {
    return 'Loading...';
  }

  return (
    <ul>
      {Object.entries(visitsGroups).map(([tag, visits]) => (
        <li key={tag}>{tag}: {visits.length}</li>
      ))}
    </ul>
  );
};
/* v8 ignore stop */
