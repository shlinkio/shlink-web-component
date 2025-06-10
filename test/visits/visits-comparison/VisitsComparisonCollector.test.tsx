import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { rangeOf } from '../../../src/utils/helpers';
import { VisitsComparisonCollector } from '../../../src/visits/visits-comparison/VisitsComparisonCollector';
import type {
  VisitsComparison,
  VisitsComparisonItem,
} from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<VisitsComparisonCollector />', () => {
  const clearItemsToCompare = vi.fn();
  const removeItemToCompare = vi.fn();
  const createItemsToCompare = (itemsAmount: number) => rangeOf(
    itemsAmount,
    (index) => ({ name: `foo${index}`, query: `bar${index}` }),
  );
  const createVisitsComparison = (items: number | VisitsComparisonItem[] = 1): VisitsComparison => fromPartial({
    itemsToCompare: typeof items === 'number' ? createItemsToCompare(items) : items,
    clearItemsToCompare,
    removeItemToCompare,
  });
  const setUp = (visitsComparison?: VisitsComparison, type: 'short-urls' | 'tags' | 'domains' = 'short-urls') =>
    renderWithEvents(
      <MemoryRouter>
        <VisitsComparisonProvider value={visitsComparison}>
          <VisitsComparisonCollector type={type} />
        </VisitsComparisonProvider>
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp(createVisitsComparison())));

  it.each([
    [undefined],
    [fromPartial<VisitsComparison>({ itemsToCompare: [] })],
  ])('does not render when no context or no items are defined', (visitsComparison) => {
    const { container } = setUp(visitsComparison);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [1, true],
    [2, false],
    [5, false],
  ])('disables compare button when there is only one selected item', (itemsAmount, isDisabled) => {
    setUp(createVisitsComparison(itemsAmount));
    const compareButton = screen.getByText(/^Compare/);

    expect(screen.getAllByRole('listitem')).toHaveLength(itemsAmount);
    expect(compareButton).toHaveAttribute('aria-disabled', isDisabled ? 'true' : 'false');
  });

  it('can clear selected items', async () => {
    const { user } = setUp(createVisitsComparison(5));

    await user.click(screen.getByLabelText('Close compare'));
    expect(clearItemsToCompare).toHaveBeenCalled();
  });

  it.each([[1], [2], [4]])('can remove individual items', async (index) => {
    const { user } = setUp(createVisitsComparison(5));

    await user.click(screen.getByLabelText(`Remove foo${index}`));
    expect(removeItemToCompare).toHaveBeenCalledWith({ name: `foo${index}`, query: `bar${index}` });
  });

  it.each([
    ['short-urls' as const],
    ['tags' as const],
    ['domains' as const],
  ])('redirects comparison to expected location', (type) => {
    setUp(createVisitsComparison(3), type);
    expect(screen.getByText(/^Compare/)).toHaveAttribute(
      'href',
      `/${type}/compare-visits?${type}=${encodeURIComponent('bar1,bar2,bar3')}`,
    );
  });

  it.each([
    [undefined, true],
    [{ color: 'red' }, true],
    [{ backgroundColor: 'red' }, false],
  ])('adds fallback background class when provided styles do not have backgroundColor', (style, hasClass) => {
    setUp(createVisitsComparison([{ name: 'foo', query: 'bar', style }]));
    const item = screen.getByRole('listitem');

    if (hasClass) {
      expect(item).toHaveClass('tw:bg-gray-500');
    } else {
      expect(item).not.toHaveClass('tw:bg-gray-500');
    }
  });

  it.each([[1], [2], [3], [4], [5]])('shows how many items are selected for comparison', (itemsAmount) => {
    setUp(createVisitsComparison(itemsAmount));
    expect(screen.getByText(/^Compare/)).toHaveTextContent(`Compare (${itemsAmount}/5)`);
  });
});
