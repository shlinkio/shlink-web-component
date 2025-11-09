import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ShortUrlsFilter } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { ShortUrlsFilterDropdown } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsFilterDropdown />', () => {
  const onChange = vi.fn();
  const setUp = (selected: ShortUrlsFilter = {}) => renderWithEvents(
    <ShortUrlsFilterDropdown onChange={onChange} selected={selected} />,
  );
  const openMenu = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Filters' }));

  const setUpOpened = async (selected?: ShortUrlsFilter) => {
    const { user, ...rest } = setUp(selected);

    await openMenu(user);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    return { user, ...rest };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('displays proper amount of menu items', async () => {
    await setUpOpened();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
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
    const { user } = await setUpOpened(selected);

    await user.click(screen.getByText(clickedItem));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining(expectedSelection));
  });

  it('disables reset button when no selection is set', async () => {
    await setUpOpened();
    expect(screen.getByText('Reset to defaults')).toBeDisabled();
  });

  it('resets selection when rest button is clicked', async () => {
    const { user } = await setUpOpened({ excludeBots: true });

    await user.click(screen.getByText('Reset to defaults'));
    expect(onChange).toHaveBeenCalledWith({
      excludeBots: undefined,
      excludeMaxVisitsReached: undefined,
      excludePastValidUntil: undefined,
      domain: undefined,
    });
  });
});
