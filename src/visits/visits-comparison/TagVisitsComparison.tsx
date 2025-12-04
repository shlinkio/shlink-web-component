import { useCallback, useMemo } from 'react';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { Tag } from '../../tags/helpers/Tag';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useTagVisitsComparison } from './reducers/tagVisitsComparison';
import type { LoadVisitsForComparison } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type TagVisitsComparisonDeps = {
  ColorGenerator: ColorGenerator;
};

const TagVisitsComparison: FCWithDeps<any, TagVisitsComparisonDeps> = boundToMercureHub(() => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagVisitsComparison);
  const tags = useArrayQueryParam('tags');
  const { getTagVisitsForComparison, tagVisitsComparison, cancelGetTagVisitsForComparison } = useTagVisitsComparison();
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getTagVisitsForComparison({ ...params, tags }),
    [getTagVisitsForComparison, tags],
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
      title={<>Comparing {tags.map((tag) => <Tag key={tag} colorGenerator={colorGenerator} text={tag} />)}</>}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={tagVisitsComparison}
      cancelGetVisitsComparison={cancelGetTagVisitsForComparison}
      colors={colors}
    />
  );
}, () => [Topics.visits]);

export const TagVisitsComparisonFactory = componentFactory(TagVisitsComparison, ['ColorGenerator']);
