import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { TagsSettings as TagsSettingsOptions } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { TagsSettings } from '../../../src/settings/components/TagsSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<TagsSettings />', () => {
  const setTagsSettings = vi.fn();
  const setUp = (tags?: TagsSettingsOptions) => renderWithEvents(
    <SettingsProvider value={fromPartial({ tags })}>
      <TagsSettings onChange={setTagsSettings} />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected amount of groups', () => {
    setUp();

    expect(screen.getByText('Default ordering for tags list:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Order by...' })).toBeInTheDocument();
  });

  it.each([
    [undefined, 'Order by...'],
    [{}, 'Order by...'],
    [{ defaultOrdering: {} }, 'Order by...'],
    [{ defaultOrdering: { field: 'tag', dir: 'DESC' } as const }, 'Order by: Tag - DESC'],
    [{ defaultOrdering: { field: 'visits', dir: 'ASC' } as const }, 'Order by: Visits - ASC'],
  ])('shows expected ordering', (tags, expectedOrder) => {
    setUp(tags);
    expect(screen.getByRole('button', { name: expectedOrder })).toBeInTheDocument();
  });

  it.each([
    ['Tag', 'tag', 'ASC'],
    ['Visits', 'visits', 'ASC'],
    ['Short URLs', 'shortUrls', 'ASC'],
  ])('invokes setTagsSettings when ordering changes', async (name, field, dir) => {
    const { user } = setUp();

    expect(setTagsSettings).not.toHaveBeenCalled();
    await user.click(screen.getByText('Order by...'));
    await user.click(screen.getByRole('menuitem', { name }));
    expect(setTagsSettings).toHaveBeenCalledWith({ defaultOrdering: { field, dir } });
  });
});
