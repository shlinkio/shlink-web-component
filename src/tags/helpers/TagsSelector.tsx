import { clsx } from 'clsx';
import type { RefObject } from 'react';
import { useRef } from 'react';
import type { OptionRendererProps, ReactTagsAPI, TagRendererProps, TagSuggestion } from 'react-tag-autocomplete';
import { ReactTags } from 'react-tag-autocomplete';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { normalizeTag } from './index';
import { Tag } from './Tag';
import { TagBullet } from './TagBullet';

let tagId = 1;

const NOT_FOUND_TAG = 'Tag not found';
const NEW_TAG = 'Add tag';
const isSelectableOption = (tag: string) => tag !== NOT_FOUND_TAG;
const isNewOption = (tag: string) => tag === NEW_TAG;
const toTagObject = (tag: string): TagSuggestion => {
  // react-tag-autocomplete uses the value to determine if a tag is already added, removing it in that case.
  // Using a unique value ensures all tags are always considered new, together with a `Set` to ignore duplicates later.
  tagId += 1;
  return { label: tag, value: `${tag}${tagId}` };
};

const buildTagRenderer = (colorGenerator: ColorGenerator) => ({ tag, onClick: deleteTag }: TagRendererProps) => (
  <Tag colorGenerator={colorGenerator} text={tag.label} className="react-tags__tag" onClose={deleteTag} />
);
const buildOptionRenderer = (colorGenerator: ColorGenerator, api: RefObject<ReactTagsAPI | null>) => (
  { option, classNames: classes, ...rest }: OptionRendererProps,
) => {
  const isSelectable = isSelectableOption(option.label);
  const isNew = isNewOption(option.label);

  return (
    <div
      className={clsx(classes.option, {
        [classes.optionIsActive]: isSelectable && option.active,
        'react-tags__listbox-option--not-selectable': !isSelectable,
      })}
      {...rest}
    >
      {!isSelectable ? <i>{option.label}</i> : (
        <>
          {!isNew && <TagBullet tag={`${option.label}`} colorGenerator={colorGenerator} />}
          {!isNew ? option.label : <i>Add &quot;{normalizeTag(api.current?.input.value ?? '')}&quot;</i>}
        </>
      )}
    </div>
  );
};

export type TagsSelectorProps = {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** If true, it won't allow adding new tags */
  immutable?: boolean;
};

type TagsSelectorDeps = {
  ColorGenerator: ColorGenerator;
};

const TagsSelector: FCWithDeps<TagsSelectorProps, TagsSelectorDeps> = (
  { selectedTags, onChange, placeholder, tags, immutable = false },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagsSelector);
  const shortUrlCreation = useSetting('shortUrlCreation');
  const searchMode = shortUrlCreation?.tagFilteringMode ?? 'startsWith';
  const apiRef = useRef<ReactTagsAPI>(null);

  return (
    <ReactTags
      ref={apiRef}
      selected={selectedTags.map(toTagObject)}
      suggestions={tags.filter((tag) => !selectedTags.includes(tag)).map(toTagObject)}
      renderTag={buildTagRenderer(colorGenerator)}
      renderOption={buildOptionRenderer(colorGenerator, apiRef)}
      activateFirstOption
      allowNew={!immutable}
      newOptionText={NEW_TAG}
      noOptionsText={NOT_FOUND_TAG}
      placeholderText={placeholder ?? 'Add tags to the URL'}
      delimiterKeys={['Enter', ',']}
      suggestionsTransform={
        (query, suggestions) => {
          const searchTerm = query.toLowerCase().trim();
          return searchTerm.length < 1 ? [] : [...suggestions.filter(
            ({ label }) => (searchMode === 'includes' ? label.includes(searchTerm) : label.startsWith(searchTerm)),
          )].slice(0, 5);
        }
      }
      onDelete={(removedTagIndex) => {
        const tagsCopy = [...selectedTags];
        tagsCopy.splice(removedTagIndex, 1);
        onChange(tagsCopy);
      }}
      onAdd={({ label: newTag }) => onChange(
        // Use a Set to ignore duplicated tags.
        // Split any of the new tags by comma, allowing to paste multiple comma-separated tags at once.
        [...new Set([...selectedTags, ...newTag.split(',').map(normalizeTag)])],
      )}
    />
  );
};

export const TagsSelectorFactory = componentFactory(TagsSelector, ['ColorGenerator']);
