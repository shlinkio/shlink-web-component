import type { ShortUrlsFilter } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { ShortUrlsFilterDropdown } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsFilterDropdown />', () => {
  const onChange = vi.fn();
  const setUp = (selected: ShortUrlsFilter = {}) =>
    renderWithEvents(<ShortUrlsFilterDropdown onChange={onChange} selected={selected} />);
  const openMenu = ({ user, ...screen }: RenderWithEventsResult) =>
    user.click(screen.getByRole('button', { name: /^More/ }));

  const setUpOpened = async (selected?: ShortUrlsFilter) => {
    const screen = await setUp(selected);

    await openMenu(screen);
    await expect.element(screen.getByRole('menu')).toBeInTheDocument();

    return screen;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('displays proper amount of menu items', async () => {
    const screen = await setUpOpened();
    expect(screen.getByRole('menuitem').all()).toHaveLength(4);
  });

  it.each([
    {
      clickedItem: 'Ignore visits from bots',
      selected: {},
      expectedSelection: { excludeBots: true },
    },
    {
      clickedItem: 'Ignore visits from bots',
      selected: { excludeBots: true },
      expectedSelection: { excludeBots: false },
    },
    {
      clickedItem: 'Exclude with visits reached',
      selected: {},
      expectedSelection: { excludeMaxVisitsReached: true },
    },
    {
      clickedItem: 'Exclude with visits reached',
      selected: { excludeMaxVisitsReached: true },
      expectedSelection: { excludeMaxVisitsReached: false },
    },
    {
      clickedItem: 'Exclude enabled in the past',
      selected: {},
      expectedSelection: { excludePastValidUntil: true },
    },
    {
      clickedItem: 'Exclude enabled in the past',
      selected: { excludePastValidUntil: true },
      expectedSelection: { excludePastValidUntil: false },
    },
  ])('selects proper filters when options are clicked', async ({ clickedItem, selected, expectedSelection }) => {
    const { user, ...screen } = await setUpOpened(selected);

    await user.click(screen.getByText(clickedItem));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining(expectedSelection));
  });

  it('disables reset button when no selection is set', async () => {
    const screen = await setUpOpened();
    expect(screen.getByText('Reset to defaults')).toBeDisabled();
  });

  it('resets selection when rest button is clicked', async () => {
    const { user, ...screen } = await setUpOpened({ excludeBots: true });

    await user.click(screen.getByText('Reset to defaults'));
    expect(onChange).toHaveBeenCalledWith({
      excludeBots: undefined,
      excludeMaxVisitsReached: undefined,
      excludePastValidUntil: undefined,
      domain: undefined,
    });
  });
});
