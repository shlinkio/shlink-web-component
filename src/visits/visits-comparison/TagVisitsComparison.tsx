import { useCallback, useMemo } from 'react';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import type { MercureBoundProps } from '../../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { Tag } from '../../tags/helpers/Tag';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import type { LoadTagVisitsForComparison } from './reducers/tagVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type TagVisitsComparisonProps = MercureBoundProps & {
  getTagVisitsForComparison: (params: LoadTagVisitsForComparison) => void;
  tagVisitsComparison: VisitsComparisonInfo;
  cancelGetTagVisitsComparison: () => void;
};

type TagVisitsComparisonDeps = {
  ColorGenerator: ColorGenerator;
};

const TagVisitsComparison: FCWithDeps<TagVisitsComparisonProps, TagVisitsComparisonDeps> = boundToMercureHub((
  { getTagVisitsForComparison, tagVisitsComparison, cancelGetTagVisitsComparison },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagVisitsComparison);
  const tags = useArrayQueryParam('tags');
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
      cancelGetVisitsComparison={cancelGetTagVisitsComparison}
      colors={colors}
    />
  );
}, () => [Topics.visits]);

export const TagVisitsComparisonFactory = componentFactory(TagVisitsComparison, ['ColorGenerator']);
