import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { TagFilteringMode } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { TagsSelectorFactory } from '../../../src/tags/helpers/TagsSelector';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { colorGeneratorMock } from '../../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  allTags?: string[];
  tagFilteringMode?: TagFilteringMode;
};

describe('<TagsSelector />', () => {
  const onChange = vi.fn();
  const TagsSelector = TagsSelectorFactory(fromPartial({ ColorGenerator: colorGeneratorMock }));
  const tags = ['foo', 'bar'];
  const setUp = ({ allTags, tagFilteringMode }: SetUpOptions = {}) => renderWithEvents(
    <SettingsProvider
      value={fromPartial({
        shortUrlCreation: { tagFilteringMode },
      })}
    >
      <TagsSelector
        tags={allTags ?? [...tags, 'baz']}
        selectedTags={tags}
        onChange={onChange}
        placeholder="Add tags to the URL"
      />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('has an input for tags', () => {
    setUp();
    expect(screen.getByPlaceholderText('Add tags to the URL')).toBeInTheDocument();
  });

  it.each([
    ['The-New-Tag', [...tags, 'the-new-tag']],
    ['AnOTH   er  tag  ', [...tags, 'anoth-er-tag']],
    ['foo', tags], // Already added tags should be ignored
  ])('invokes onChange when new tags are added', async (newTag, expectedTags) => {
    const { user } = setUp();

    expect(onChange).not.toHaveBeenCalled();
    await user.type(screen.getByPlaceholderText('Add tags to the URL'), newTag);
    await user.type(screen.getByPlaceholderText('Add tags to the URL'), '{Enter}');
    expect(onChange).toHaveBeenCalledWith(expectedTags);
  });
});
