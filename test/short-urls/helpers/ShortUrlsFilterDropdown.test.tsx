import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { ShortUrlsFilterDropdown } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsFilterDropdown />', () => {
  const setUp = (supportsDisabledFiltering: boolean) => renderWithEvents(
    <ShortUrlsFilterDropdown onChange={vi.fn()} supportsDisabledFiltering={supportsDisabledFiltering} />,
  );
  const openMenu = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Filters' }));

  it.each([
    [() => setUp(true)],
    // TODO Enable back once https://github.com/reactstrap/reactstrap/issues/2759 is fixed
    // [async () => {
    //   const { user, container } = setUp(true);
    //   await openMenu(user);
    //
    //   return { container };
    // }],
  ])('passes a11y checks', async (setUp) => checkAccessibility(await setUp()));

  it.each([
    [true, 3],
    [false, 1],
  ])('displays proper amount of menu items', async (supportsDisabledFiltering, expectedItems) => {
    const { user } = setUp(supportsDisabledFiltering);

    await openMenu(user);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedItems);
  });
});
