import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShortUrlsListSettings as ShortUrlsSettings } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { ShortUrlsListSettings } from '../../../src/settings/components/ShortUrlsListSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsListSettings />', () => {
  const setSettings = vi.fn();
  const setUp = (shortUrlsList?: ShortUrlsSettings) => renderWithEvents(
    <SettingsProvider value={fromPartial({ shortUrlsList })}>
      <ShortUrlsListSettings
        onChange={setSettings}
        defaultOrdering={{ field: 'dateCreated', dir: 'DESC' }}
      />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [undefined, 'Order by: Created at - DESC'],
    [fromPartial<ShortUrlsSettings>({}), 'Order by: Created at - DESC'],
    [fromPartial<ShortUrlsSettings>({ defaultOrdering: {} }), 'Order by...'],
    [fromPartial<ShortUrlsSettings>({ defaultOrdering: { field: 'longUrl', dir: 'DESC' } }), 'Order by: Long URL - DESC'],
    [fromPartial<ShortUrlsSettings>({ defaultOrdering: { field: 'visits', dir: 'ASC' } }), 'Order by: Visits - ASC'],
  ])('shows expected ordering', (shortUrlsList, expectedOrder) => {
    setUp(shortUrlsList);
    expect(screen.getByRole('button')).toHaveTextContent(expectedOrder);
  });

  it.each([
    ['Clear selection', undefined, undefined],
    ['Long URL', 'longUrl', 'ASC'],
    ['Visits', 'visits', 'ASC'],
    ['Title', 'title', 'ASC'],
  ])('invokes setSettings when ordering changes', async (name, field, dir) => {
    const { user } = setUp();

    expect(setSettings).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name }));
    expect(setSettings).toHaveBeenCalledWith({ defaultOrdering: { field, dir } });
  });

  it.each([
    [{ confirmDeletions: true }, true],
    [{ confirmDeletions: false }, false],
    [undefined, true],
  ])('Deletion confirmation switch has proper initial state', (shortUrlCreation, expectedChecked) => {
    const matcher = /^Request confirmation before deleting a short URL./;

    setUp(shortUrlCreation);

    const checkbox = screen.getByLabelText(matcher);
    const label = screen.getByText(matcher);

    if (expectedChecked) {
      expect(checkbox).toBeChecked();
      expect(label).toHaveTextContent('When deleting a short URL, confirmation will be required.');
      expect(label).not.toHaveTextContent('When deleting a short URL, confirmation won\'t be required.');
    } else {
      expect(checkbox).not.toBeChecked();
      expect(label).toHaveTextContent('When deleting a short URL, confirmation won\'t be required.');
      expect(label).not.toHaveTextContent('When deleting a short URL, confirmation will be required.');
    }
  });

  it.each([
    { confirmDeletions: true },
    { confirmDeletions: false },
  ])('invokes setSettings when delete confirmation toggle value changes', async ({ confirmDeletions }) => {
    const { user } = setUp({ confirmDeletions });

    expect(setSettings).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(/^Request confirmation before deleting a short URL./));
    expect(setSettings).toHaveBeenCalledWith({ confirmDeletions: !confirmDeletions });
  });
});
