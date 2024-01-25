import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ShlinkOrphanVisitType } from '../../../src/api-contract';
import type { Filter } from '../../../src/visits/helpers/VisitsFilterDropdown';
import { VisitsFilterDropdown } from '../../../src/visits/helpers/VisitsFilterDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  selected?: Filter;
  isOrphanVisits?: boolean
  withPrevInterval?: boolean
};

describe('<VisitsFilterDropdown />', () => {
  const onChange = vi.fn();
  const setUp = (
    { selected = {}, isOrphanVisits = true, withPrevInterval = false }: SetUpOptions = {},
  ) => renderWithEvents(
    <VisitsFilterDropdown
      isOrphanVisits={isOrphanVisits}
      withPrevInterval={withPrevInterval}
      selected={selected}
      onChange={onChange}
    />,
  );
  const openDropdown = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'More' }));

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
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it.each([
    [false, false, 1, 1],
    [true, false, 4, 2],
    [false, true, 2, 1],
    [true, true, 5, 2],
  ])(
    'renders expected amount of items',
    async (isOrphanVisits, withPrevInterval, expectedItemsAmount, expectedHeadersAmount) => {
      const { user } = setUp({ isOrphanVisits, withPrevInterval });

      await openDropdown(user);

      expect(screen.getAllByRole('menuitem')).toHaveLength(expectedItemsAmount);
      expect(screen.getAllByRole('heading', { hidden: true })).toHaveLength(expectedHeadersAmount);
    },
  );

  it.each([
    ['base_url' as ShlinkOrphanVisitType, 1, 1],
    ['invalid_short_url' as ShlinkOrphanVisitType, 2, 1],
    ['regular_404' as ShlinkOrphanVisitType, 3, 1],
    [undefined, -1, 0],
  ])('sets expected item as active', async (orphanVisitsType, expectedSelectedIndex, expectedActiveItems) => {
    const { user } = setUp({ selected: { orphanVisitsType } });

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
    ['Exclude potential bots', { excludeBots: true }, {}],
    ['Exclude potential bots', { excludeBots: false }, { excludeBots: true }],
    ['Compare with previous period', { loadPrevInterval: true }, {}],
    ['Compare with previous period', { loadPrevInterval: false }, { loadPrevInterval: true }],
    ['Base URL', { orphanVisitsType: 'base_url' }, {}],
    ['Invalid short URL', { orphanVisitsType: 'invalid_short_url' }, {}],
    ['Regular 404', { orphanVisitsType: 'regular_404' }, {}],
    [
      'Reset to defaults',
      { orphanVisitsType: undefined, excludeBots: undefined, loadPrevInterval: undefined },
      { excludeBots: true },
    ],
  ])('invokes onChange with proper selection when an item is clicked', async (name, expectedSelection, selected) => {
    const { user } = setUp({ selected, withPrevInterval: true });

    expect(onChange).not.toHaveBeenCalled();
    await openDropdown(user);
    await user.click(screen.getByRole('menuitem', { name }));
    expect(onChange).toHaveBeenCalledWith(expectedSelection);
  });
});
