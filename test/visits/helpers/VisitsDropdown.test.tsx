import type { ShlinkOrphanVisitType } from '../../../src/api-contract';
import type { DropdownOptions } from '../../../src/visits/helpers/VisitsDropdown';
import { VisitsDropdown } from '../../../src/visits/helpers/VisitsDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  selected?: DropdownOptions;
  isOrphanVisits?: boolean;
  withPrevInterval?: boolean;
};

describe('<VisitsDropdown />', () => {
  const onChange = vi.fn();
  const setUp = ({ selected = {}, isOrphanVisits = true, withPrevInterval = false }: SetUpOptions = {}) =>
    renderWithEvents(
      <VisitsDropdown
        isOrphanVisits={isOrphanVisits}
        withPrevInterval={withPrevInterval}
        selected={selected}
        onChange={onChange}
      />,
    );
  const openDropdown = ({ user, ...screen }: RenderWithEventsResult) =>
    user.click(screen.getByRole('button', { name: 'More' }));

  it.each([
    [setUp],
    [
      async () => {
        const result = await setUp();
        await openDropdown(result);

        return result;
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('has expected text', async () => {
    const screen = await setUp();
    await expect.element(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it.each([
    [false, false, 2, 1],
    [true, false, 5, 2],
    [false, true, 3, 1],
    [true, true, 6, 2],
  ])(
    'renders expected amount of items',
    async (isOrphanVisits, withPrevInterval, expectedItemsAmount, expectedHeadersAmount) => {
      const { user, ...screen } = await setUp({ isOrphanVisits, withPrevInterval });

      await openDropdown({ user, ...screen });

      expect(screen.getByRole('menuitem').all()).toHaveLength(expectedItemsAmount);
      expect(screen.getByRole('heading', { includeHidden: true }).all()).toHaveLength(expectedHeadersAmount);
    },
  );

  it.each([
    ['base_url' as ShlinkOrphanVisitType, 1, 1],
    ['invalid_short_url' as ShlinkOrphanVisitType, 2, 1],
    ['regular_404' as ShlinkOrphanVisitType, 3, 1],
    [undefined, -1, 0],
  ])('sets expected item as active', async (orphanVisitsType, expectedSelectedIndex, expectedActiveItems) => {
    const { user, ...screen } = await setUp({ selected: { orphanVisitsType } });

    await openDropdown({ user, ...screen });

    const items = screen.getByRole('menuitem').elements();
    const activeItem = items.filter((item) => item.dataset.selected === 'true');

    expect.assertions(expectedActiveItems + 1);
    expect(activeItem).toHaveLength(expectedActiveItems);
    items.forEach((item, index) => {
      if (item.dataset.selected === 'true') {
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
    ['Base URL', { excludeBots: true, orphanVisitsType: 'base_url' }, { excludeBots: true }],
    ['Invalid short URL', { orphanVisitsType: 'invalid_short_url' }, {}],
    ['Invalid short URL', { orphanVisitsType: undefined }, { orphanVisitsType: 'invalid_short_url' as const }],
    ['Regular 404', { orphanVisitsType: 'regular_404' }, {}],
    [
      'Reset to defaults',
      { orphanVisitsType: undefined, excludeBots: undefined, loadPrevInterval: undefined },
      { excludeBots: true },
    ],
  ])('invokes onChange with proper selection when an item is clicked', async (name, expectedSelection, selected) => {
    const { user, ...screen } = await setUp({ selected, withPrevInterval: true });

    expect(onChange).not.toHaveBeenCalled();
    await openDropdown({ user, ...screen });
    await user.click(screen.getByRole('menuitem', { name }));
    expect(onChange).toHaveBeenCalledWith(expectedSelection);
  });
});
