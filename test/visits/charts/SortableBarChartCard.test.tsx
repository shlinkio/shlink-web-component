import { range } from '@shlinkio/data-manipulation';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { rangeOf } from '../../../src/utils/helpers';
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

  it('renders stats unchanged when no ordering is set', () => {
    const { container } = setUp();

    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild).toMatchSnapshot();
  });

  it.each([
    ['Name', 1],
    ['Amount', 1],
    ['Name', 2],
    ['Amount', 2],
  ])('renders properly ordered stats when ordering is set', async (name, clicks) => {
    const { user } = setUp();

    await user.click(screen.getByRole('button'));
    await Promise.all(rangeOf(clicks, async () => user.click(screen.getByRole('menuitem', { name }))));

    expect(screen.getByRole('document')).toMatchSnapshot();
  });

  it.each([
    [0],
    [1],
    [2],
    [3],
  ])('renders properly paginated stats when pagination is set', async (itemIndex) => {
    const { user } = setUp({
      withPagination: true,
      extraStats: range(1, 159).reduce<Stats>((accum, value) => {
        accum[`key_${value}`] = value;
        return accum;
      }, {}),
    });

    await user.click(screen.getAllByRole('button')[1]);
    await user.click(screen.getAllByRole('menuitem')[itemIndex]);

    expect(screen.getByRole('document')).toMatchSnapshot();
  });

  it('renders highlighted and prev stats when provided', () => {
    const { container } = setUp({
      highlightedStats: {
        Foo: 25,
        Bar: 40,
      },
      prevStats: {
        Foo: 25,
        Bar: 40,
        Baz: 400,
      },
    });

    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders extra header content', () => {
    setUp({
      extra: () => (
        <span>
          <span className="foo-span">Foo in header</span>
          <span className="bar-span">Bar in header</span>
        </span>
      ),
    });

    expect(screen.getByText('Foo in header')).toHaveClass('foo-span');
    expect(screen.getByText('Bar in header')).toHaveClass('bar-span');
  });
});
