import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { withDependencies } from '../../container/context';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { Tag } from '../../tags/helpers/Tag';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { useTagVisitsComparison } from './reducers/tagVisitsComparison';
import type { LoadVisitsForComparison } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

export type TagVisitsComparisonProps = {
  ColorGenerator: ColorGenerator;
};

const TagVisitsComparisonBase: FC<TagVisitsComparisonProps> = boundToMercureHub((
  { ColorGenerator: colorGenerator },
) => {
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

export const TagVisitsComparison = withDependencies(TagVisitsComparisonBase, ['ColorGenerator']);
