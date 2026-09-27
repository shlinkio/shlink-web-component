import { fromPartial } from '@total-typescript/shoehorn';
import type { ShortUrlsListSettings as ShortUrlsSettings } from '../../../src/settings';
import { SettingsProvider } from '../../../src/settings';
import { ShortUrlsListSettings } from '../../../src/settings/components/ShortUrlsListSettings';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsListSettings />', () => {
  const setSettings = vi.fn();
  const setUp = (shortUrlsList?: ShortUrlsSettings) =>
    renderWithEvents(
      <SettingsProvider value={fromPartial({ shortUrlsList })}>
        <ShortUrlsListSettings onChange={setSettings} defaultOrdering={{ field: 'dateCreated', dir: 'DESC' }} />
      </SettingsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [undefined, 'Order by: Created at - DESC'],
    [fromPartial<ShortUrlsSettings>({}), 'Order by: Created at - DESC'],
    [fromPartial<ShortUrlsSettings>({ defaultOrdering: {} }), 'Order by...'],
    [
      fromPartial<ShortUrlsSettings>({ defaultOrdering: { field: 'longUrl', dir: 'DESC' } }),
      'Order by: Long URL - DESC',
    ],
    [fromPartial<ShortUrlsSettings>({ defaultOrdering: { field: 'visits', dir: 'ASC' } }), 'Order by: Visits - ASC'],
  ])('shows expected ordering', async (shortUrlsList, expectedOrder) => {
    const screen = await setUp(shortUrlsList);
    await expect.element(screen.getByRole('button')).toMatchTextContent(expectedOrder);
  });

  it.each([
    ['Clear selection', undefined, undefined],
    ['Long URL', 'longUrl', 'ASC'],
    ['Visits', 'visits', 'ASC'],
    ['Title', 'title', 'ASC'],
  ])('invokes setSettings when ordering changes', async (name, field, dir) => {
    const { user, ...screen } = await setUp();

    expect(setSettings).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name }));
    expect(setSettings).toHaveBeenCalledWith({ defaultOrdering: !field && !dir ? undefined : { field, dir } });
  });

  it.each([
    [{ confirmDeletions: true }, true],
    [{ confirmDeletions: false }, false],
    [undefined, true],
  ])('Deletion confirmation switch has proper initial state', async (shortUrlCreation, expectedChecked) => {
    const matcher = /^Request confirmation before deleting a short URL./;

    const screen = await setUp(shortUrlCreation);

    const checkbox = screen.getByLabelText(matcher);
    const helpText = screen.getByTestId('help-text');

    if (expectedChecked) {
      await expect.element(checkbox).toBeChecked();
      await expect.element(helpText).toMatchTextContent('When deleting a short URL, confirmation will be required.');
      await expect
        .element(helpText)
        .not.toMatchTextContent("When deleting a short URL, confirmation won't be required.");
    } else {
      await expect.element(checkbox).not.toBeChecked();
      await expect.element(helpText).toMatchTextContent("When deleting a short URL, confirmation won't be required.");
      await expect
        .element(helpText)
        .not.toMatchTextContent('When deleting a short URL, confirmation will be required.');
    }
  });

  it.each([{ confirmDeletions: true }, { confirmDeletions: false }])(
    'invokes setSettings when delete confirmation toggle value changes',
    async ({ confirmDeletions }) => {
      const { user, ...screen } = await setUp({ confirmDeletions });

      expect(setSettings).not.toHaveBeenCalled();
      await user.click(screen.getByLabelText(/^Request confirmation before deleting a short URL./));
      expect(setSettings).toHaveBeenCalledWith({ confirmDeletions: !confirmDeletions });
    },
  );
});
