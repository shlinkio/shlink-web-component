import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ShlinkOrphanVisitType } from '../../../src/api-contract';
import { VisitsFilterDropdown } from '../../../src/visits/helpers/VisitsFilterDropdown';
import type { VisitsFilter } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsFilterDropdown />', () => {
  const onChange = vi.fn();
  const setUp = (selected: VisitsFilter = {}, isOrphanVisits = true) => renderWithEvents(
    <VisitsFilterDropdown
      isOrphanVisits={isOrphanVisits}
      selected={selected}
      onChange={onChange}
    />,
  );
  const openDropdown = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Filters' }));

  it.each([
    [setUp],
    // TODO Enable back once https://github.com/reactstrap/reactstrap/issues/2759 is fixed
    // [async () => {
    //   const { user, container } = setUp();
    //   await openDropdown(user);
    //
    //   return { container };
    // }],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('has expected text', () => {
    setUp();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
  });

  it.each([
    [false, 1, 1],
    [true, 4, 2],
  ])('renders expected amount of items', async (isOrphanVisits, expectedItemsAmount, expectedHeadersAmount) => {
    const { user } = setUp({}, isOrphanVisits);

    await openDropdown(user);

    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedItemsAmount);
    expect(screen.getAllByRole('heading', { hidden: true })).toHaveLength(expectedHeadersAmount);
  });

  it.each([
    ['base_url' as ShlinkOrphanVisitType, 1, 1],
    ['invalid_short_url' as ShlinkOrphanVisitType, 2, 1],
    ['regular_404' as ShlinkOrphanVisitType, 3, 1],
    [undefined, -1, 0],
  ])('sets expected item as active', async (orphanVisitsType, expectedSelectedIndex, expectedActiveItems) => {
    const { user } = setUp({ orphanVisitsType });

    await openDropdown(user);

    const items = screen.getAllByRole('menuitem');
    const activeItem = items.filter((item) => item.classList.contains('active'));

    expect.assertions(expectedActiveItems + 1);
    expect(activeItem).toHaveLength(expectedActiveItems);
    items.forEach((item, index) => {
      if (item.classList.contains('active')) {
        expect(index).toEqual(expectedSelectedIndex);
      }
    });
  });

  it.each([
    [0, { excludeBots: true }, {}],
    [1, { orphanVisitsType: 'base_url' }, {}],
    [2, { orphanVisitsType: 'invalid_short_url' }, {}],
    [3, { orphanVisitsType: 'regular_404' }, {}],
    [4, { orphanVisitsType: undefined, excludeBots: false }, { excludeBots: true }],
  ])('invokes onChange with proper selection when an item is clicked', async (index, expectedSelection, selected) => {
    const { user } = setUp(selected);

    expect(onChange).not.toHaveBeenCalled();
    await openDropdown(user);
    await user.click(screen.getAllByRole('menuitem')[index]);
    expect(onChange).toHaveBeenCalledWith(expectedSelection);
  });
});
