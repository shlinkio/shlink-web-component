import type { TagsAutocompleteProps } from '@shlinkio/shlink-frontend-kit';
import { TagsAutocomplete } from '@shlinkio/shlink-frontend-kit';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

export type TagsSelectorProps = {
  onChange: (tags: string[]) => void;
} & Pick<TagsAutocompleteProps, 'tags' | 'selectedTags' | 'placeholder' | 'immutable' | 'containerClassName'>;

type TagsSelectorDeps = {
  ColorGenerator: ColorGenerator;
};

const TagsSelector: FCWithDeps<TagsSelectorProps, TagsSelectorDeps> = ({ onChange, placeholder, ...rest }) => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagsSelector);
  const shortUrlCreation = useSetting('shortUrlCreation');
  const searchMode = shortUrlCreation?.tagFilteringMode ?? 'startsWith';

  return (
    <TagsAutocomplete
      {...rest}
      onTagsChange={onChange}
      getColorForTag={(tag) => colorGenerator.getColorForKey(tag)}
      size="lg"
      placeholder={placeholder ?? 'Add tags to the URL'}
      searchMode={searchMode}
    />
  );
};

export const TagsSelectorFactory = componentFactory(TagsSelector, ['ColorGenerator']);
