import { faClose, faTag, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, formatNumber, SearchCombobox } from '@shlinkio/shlink-frontend-kit';
import type { TagsFilteringMode } from '@shlinkio/shlink-js-sdk/api-contract';
import { useCallback, useState } from 'react';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { useSetting } from '../../settings';
import { ColorBullet } from '../../utils/components/ColorBullet';
import { Muted } from '../../utils/components/Muted';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import { Tag } from './Tag';

const ONE_OR_MORE_SPACES_REGEX = /\s+/g;
/**
 * Normalizes a tag, making it lowercase, trimmed and replacing space characters with dashes
 */
const normalizeTag = (tag: string) => tag.trim().toLowerCase().replace(ONE_OR_MORE_SPACES_REGEX, '-');

export type TagsSearchDropdownProps = {
  /** The full list of tags to filter from */
  tags: string[];
  /** Currently selected tags */
  selectedTags: string[];
  /** Invoked every time selected tags change */
  onTagsChange?: (tags: string[]) => void;
  /** Current tags mode */
  mode?: TagsFilteringMode;
  /** Invoked when tags mode changes */
  onModeChange?: (mode: TagsFilteringMode) => void;

  buttonClassName?: string;
  title: string;
  prefix: string;
};

type TagsSearchDropdownDeps = {
  ColorGenerator: ColorGenerator;
};

const TagsSearchDropdown: FCWithDeps<TagsSearchDropdownProps, TagsSearchDropdownDeps> = (
  { tags, selectedTags, onTagsChange, mode = 'any', onModeChange, buttonClassName, title, prefix },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(TagsSearchDropdown);
  const shortUrlCreation = useSetting('shortUrlCreation');
  const searchMode = shortUrlCreation?.tagFilteringMode ?? 'startsWith';

  const [searchResults, setSearchResults] = useState<Map<string, string>>();
  const onSearch = useCallback((searchTerm: string) => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    if (!normalizedSearchTerm) {
      setSearchResults(undefined);
      return;
    }

    const matches: string[] = tags
      .filter((t) => {
        // Exclude any tag which is already selected
        if (selectedTags.includes(t)) {
          return false;
        }

        const lowerTag = t.toLowerCase();
        return lowerTag[searchMode](normalizedSearchTerm);
      })
      // Do not show more than 5 matches
      .slice(0, 5);

    setSearchResults(new Map(matches.map((tag) => [tag, tag])));
  }, [searchMode, selectedTags, tags]);

  const addTag = useCallback(
    (tag: string) => onTagsChange?.([...new Set([...selectedTags, normalizeTag(tag)])]),
    [onTagsChange, selectedTags],
  );
  const removeTag = useCallback(
    (deletedTag: string) => onTagsChange?.(selectedTags.filter((tag) => tag !== deletedTag)),
    [onTagsChange, selectedTags],
  );

  return (
    <Dropdown
      buttonContent={
        selectedTags.length
          ? <span>{prefix} <b>{formatNumber(selectedTags.length)}</b> tag{selectedTags.length > 1 && 's'}</span>
          : <>{prefix} tags...</>
      }
      menuAlignment="right"
      menuClassName="min-w-72 w-full"
      buttonClassName={buttonClassName}
    >
      <Dropdown.Title>{title}:</Dropdown.Title>
      <Dropdown.Misc className="flex flex-col gap-3">
        <SearchCombobox
          size="sm"
          searchResults={searchResults}
          onSearch={onSearch}
          onSelectSearchResult={addTag}
          renderSearchResult={(tag) => (
            <div className="flex items-center">
              <ColorBullet color={colorGenerator.getColorForKey(tag)} />
              {tag}
            </div>
          )}
        />
        {selectedTags.length > 0 && (
          <>
            <ul className="flex gap-1 flex-wrap">
              {selectedTags.map((tag, index) => (
                <li key={`${tag}${index}`}>
                  <Tag text={tag} colorGenerator={colorGenerator} onClose={() => removeTag(tag)} />
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" onClick={() => onTagsChange?.([])} className="gap-1!">
              <FontAwesomeIcon icon={faClose} /> Clear tags
            </Button>
          </>
        )}
      </Dropdown.Misc>

      <Dropdown.Separator />

      <Dropdown.Title>Mode:</Dropdown.Title>
      <Dropdown.Misc className="flex flex-col gap-1">
        <div className="flex">
          <Button
            className="w-1/2 rounded-r-none gap-1! border-r-0"
            size="sm"
            solid={mode === 'any'}
            onClick={() => onModeChange?.('any')}
          >
            <FontAwesomeIcon icon={faTag} /> Any
          </Button>
          <Button
            className="w-1/2 rounded-l-none gap-1!"
            size="sm"
            solid={mode === 'all'}
            onClick={() => onModeChange?.('all')}
          >
            <FontAwesomeIcon icon={faTags} /> All
          </Button>
        </div>
        <Muted>{prefix} <b>{mode}</b> of the tags</Muted>
      </Dropdown.Misc>
    </Dropdown>
  );
};

export const TagsSearchDropdownFactory = componentFactory(TagsSearchDropdown, ['ColorGenerator']);
