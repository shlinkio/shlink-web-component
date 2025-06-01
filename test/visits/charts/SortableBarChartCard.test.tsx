import { range } from '@shlinkio/data-manipulation';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SortableBarChartCard } from '../../../src/visits/charts/SortableBarChartCard';
import type { Stats } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  withPagination?: boolean;
  extraStats?: Stats;
  prevStats?: Stats;
  highlightedStats?: Stats;
  extra?: (foo?: string[]) => ReactNode;
};

describe('<SortableBarChartCard />', () => {
  const sortingItems = {
    name: 'Name',
    amount: 'Amount',
  };
  const stats = {
    Foo: 100,
    Bar: 50,
  };
  const setUp = (
    { withPagination = false, extraStats = {}, highlightedStats, prevStats, extra }: SetUpOptions = {},
  ) => renderWithEvents(
    <SortableBarChartCard
      title="Foo"
      stats={{ ...stats, ...extraStats }}
      prevStats={prevStats}
      highlightedStats={highlightedStats}
      sortingItems={sortingItems}
      withPagination={withPagination}
      extraHeaderContent={extra}
    />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    'Name',
    'Amount',
  ])('renders properly ordered stats when ordering is set', async (orderField) => {
    const { user, container } = setUp();
    const checkCoordinates = () => {
      const spans = Array.from(container.querySelectorAll('tspan'));
      const fooY = spans.find((span) => span.textContent === 'Foo')?.parentElement?.getAttribute('y');
      const barY = spans.find((span) => span.textContent === 'Bar')?.parentElement?.getAttribute('y');

      return [Number(fooY), Number(barY)];
    };
    const orderByField = async () => {
      await user.click(screen.getByRole('button', { name: 'Order by' }));
      await user.click(screen.getByRole('menuitem', { name: orderField }));
    };

    // Order by the field in one direction. Bar should be first
    await orderByField();
    const [initialDirectionFooY, initialDirectionBarY] = checkCoordinates();
    expect(initialDirectionFooY).toBeGreaterThan(initialDirectionBarY);

    // Order by the field in the opposite direction. Foo should be first
    await orderByField();
    const [oppositeDirectionFooY, oppositeDirectionBarY] = checkCoordinates();
    expect(oppositeDirectionFooY).toBeLessThan(oppositeDirectionBarY);

    // Reset order. Foo should be first
    await orderByField();
    const [fooYAfterReset, barYAfterReset] = checkCoordinates();
    expect(fooYAfterReset).toBeLessThan(barYAfterReset);
  });

  it.each([
    [0, 4],
    [1, 3],
    [2, 2],
    [3, 0],
    ['Clear pagination', 0],
  ])('renders properly paginated stats when pagination is set', async (itemIndex, expectedPages) => {
    const { user } = setUp({
      withPagination: true,
      extraStats: range(1, 200).reduce<Stats>((accum, value) => {
        accum[`key_${value}`] = value;
        return accum;
      }, {}),
    });

    await user.click(screen.getByRole('button', { name: 'Paginate' }));
    if (typeof itemIndex === 'string') {
      await user.click(screen.getByRole('menuitem', { name: itemIndex }));
    } else {
      await user.click(screen.getAllByRole('menuitem', { name: /items per page$/ })[itemIndex]);
    }

    if (expectedPages > 0) {
      const pagination = screen.getByTestId('chart-paginator');
      expect(pagination).toBeInTheDocument();
      // Add one page for the `next` button
      expect(pagination.querySelectorAll('button')).toHaveLength(expectedPages + 1);
    } else {
      expect(screen.queryByTestId('chart-paginator')).not.toBeInTheDocument();
    }
  });

  it.each([
    { withHighlights: true, withPrev: true, expectedRectangles: 3 },
    { withHighlights: true, withPrev: false, expectedRectangles: 2 },
    { withHighlights: false, withPrev: true, expectedRectangles: 2 },
    { withHighlights: false, withPrev: false, expectedRectangles: 1 },
  ])('renders highlighted and prev stats when provided', ({ withHighlights, withPrev, expectedRectangles }) => {
    const { container } = setUp({
      highlightedStats: withHighlights ? {
        Foo: 25,
        Bar: 40,
      } : undefined,
      prevStats: withPrev ? {
        Foo: 25,
        Bar: 40,
        Baz: 400,
      } : undefined,
    });

    expect(container.querySelectorAll('.recharts-bar-rectangles')).toHaveLength(expectedRectangles);
  });

  it('renders extra header content', () => {
    setUp({
      extra: () => (
        <span>
          <span>Foo in header</span>
          <span>Bar in header</span>
        </span>
      ),
    });

    expect(screen.getByText('Foo in header')).toBeInTheDocument();
    expect(screen.getByText('Bar in header')).toBeInTheDocument();
  });
});
