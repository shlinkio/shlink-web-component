import { useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { Tag } from '../../tags/helpers/Tag';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import type { LoadTagVisitsForComparison } from './reducers/tagVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type TagVisitsComparisonProps = {
  getTagVisitsForComparison: (params: LoadTagVisitsForComparison) => void;
  tagVisitsComparison: VisitsComparisonInfo;
  cancelGetTagVisitsComparison: () => void;
};

type TagVisitsComparisonDeps = {
  ColorGenerator: ColorGenerator;
};

// TODO Bind to mercure for visits creation
const TagVisitsComparison: FCWithDeps<TagVisitsComparisonProps, TagVisitsComparisonDeps> = (
  { getTagVisitsForComparison, tagVisitsComparison },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagVisitsComparison);
  const { tags } = useParsedQuery<{ tags: string }>();
  const tagsArray = useMemo(() => tags.split(','), [tags]);
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getTagVisitsForComparison({ ...params, tags: tagsArray }),
    [getTagVisitsForComparison, tagsArray],
  );
  const { visitsGroups } = tagVisitsComparison;
  const colors = useMemo(
    () => Object.keys(visitsGroups).reduce<Record<string, string>>((acc, key) => {
      acc[key] = colorGenerator.getColorForKey(key);
      return acc;
    }, {}),
    [colorGenerator, visitsGroups],
  );

  return (
    <VisitsComparison
      title={<>Comparing {tagsArray.map((tag) => <Tag key={tag} colorGenerator={colorGenerator} text={tag} />)}</>}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={tagVisitsComparison}
      colors={colors}
    />
  );
};

export const TagVisitsComparisonFactory = componentFactory(TagVisitsComparison, ['ColorGenerator']);
