import type { TagsAutocompleteProps } from '@shlinkio/shlink-frontend-kit';
import { TagsAutocomplete } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { withDependencies } from '../../container/context';
import { useSetting } from '../../settings';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

export type TagsSelectorProps = {
  onChange: (tags: string[]) => void;
  ColorGenerator: ColorGenerator;
} & Pick<TagsAutocompleteProps, 'tags' | 'selectedTags' | 'placeholder'>;

const TagsSelectorBase: FC<TagsSelectorProps> = ({ onChange, ColorGenerator: colorGenerator, ...rest }) => {
  const shortUrlCreation = useSetting('shortUrlCreation');
  const searchMode = shortUrlCreation?.tagFilteringMode ?? 'startsWith';

  return (
    <TagsAutocomplete
      {...rest}
      onTagsChange={onChange}
      getColorForTag={(tag) => colorGenerator.getColorForKey(tag)}
      size="lg"
      searchMode={searchMode}
    />
  );
};

export const TagsSelector = withDependencies(TagsSelectorBase, ['ColorGenerator']);
