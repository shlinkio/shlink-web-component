import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, subDays, subMonths, subYears } from 'date-fns';
import { isBeforeOrEqual } from '../../../src/utils/dates/helpers/date';
import type { StrictDateRange } from '../../../src/utils/dates/helpers/dateIntervals';
import { ChartDimensionsProvider } from '../../../src/visits/charts/ChartDimensionsContext';
import type { VisitsList } from '../../../src/visits/charts/LineChartCard';
import { LineChartCard } from '../../../src/visits/charts/LineChartCard';
import type { NormalizedVisit } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  visitsGroups?: Record<string, VisitsList>;
};

describe('<LineChartCard />', () => {
  const onDateRangeChange = vi.fn();
  const setUp = ({ visitsGroups = {} }: SetUpOptions = {}) => renderWithEvents(
    <ChartDimensionsProvider value={{ width: 800, height: 400 }}>
      <LineChartCard visitsGroups={visitsGroups} onDateRangeChange={onDateRangeChange} />
    </ChartDimensionsProvider>,
  );

  const asMainVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(visits, { type: 'main' as const });
  const asHighlightedVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(
    visits,
    { type: 'highlighted' as const },
  );
  const asPrevVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(visits, { type: 'previous' as const });
  const asColoredVisits = (visits: NormalizedVisit[], color: string): VisitsList => Object.assign(visits, { color });

  const setUpChartWithData = () => {
    const visitsGroups = {
      foo: asMainVisits([
        fromPartial<NormalizedVisit>({ date: '2023-04-01' }),
        fromPartial<NormalizedVisit>({ date: '2023-04-02' }),
        fromPartial<NormalizedVisit>({ date: '2023-04-03' }),
      ]),
      bar: asMainVisits([
        fromPartial<NormalizedVisit>({ date: '2024-04-01' }),
        fromPartial<NormalizedVisit>({ date: '2024-04-03' }),
        fromPartial<NormalizedVisit>({ date: '2024-04-05' }),
        fromPartial<NormalizedVisit>({ date: '2024-04-07' }),
      ]),
    };
    const { container, ...rest } = setUp({ visitsGroups });
    const chart = container.querySelector('.recharts-surface');
    if (!chart) {
      throw new Error('Chart element with selector ".recharts-surface" not found');
    }

    return { chart, container, ...rest };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [[], 0],
    [[{ date: formatISO(subDays(new Date(), 1)) }], 3],
    [[{ date: formatISO(subDays(new Date(), 3)) }], 2],
    [[{ date: formatISO(subMonths(new Date(), 2)) }], 1],
    [[{ date: formatISO(subMonths(new Date(), 6)) }], 1],
    [[{ date: formatISO(subMonths(new Date(), 7)) }], 0],
    [[{ date: formatISO(subYears(new Date(), 1)) }], 0],
  ])('renders group menu and selects proper grouping item based on visits dates', async (
    visits,
    expectedActiveIndex,
  ) => {
    const { user } = setUp({
      visitsGroups: { v: asMainVisits(visits.map((visit) => fromPartial(visit))) },
    });

    await user.click(screen.getByRole('button', { name: /Group by/ }));

    const items = screen.getAllByRole('menuitem');

    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('Month');
    expect(items[1]).toHaveTextContent('Week');
    expect(items[2]).toHaveTextContent('Day');
    expect(items[3]).toHaveTextContent('Hour');
    expect(items[expectedActiveIndex]).toHaveAttribute('data-selected', 'true');
  });

  it.each([
    [{}],
    [{ v: asMainVisits([]), h: asHighlightedVisits([]), p: asPrevVisits([]) }],
    [{ v: asMainVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]), h: asHighlightedVisits([]) }],
    [
      {
        v: asMainVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]),
        h: asHighlightedVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]),
        p: asPrevVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]),
      },
    ],
    [
      {
        foo: asColoredVisits([
          fromPartial<NormalizedVisit>({ date: '2023-04-01' }),
          fromPartial<NormalizedVisit>({ date: '2023-04-02' }),
          fromPartial<NormalizedVisit>({ date: '2023-04-03' }),
        ], 'red'),
        bar: asColoredVisits([
          fromPartial<NormalizedVisit>({ date: '2024-04-01' }),
          fromPartial<NormalizedVisit>({ date: '2024-04-03' }),
          fromPartial<NormalizedVisit>({ date: '2024-04-05' }),
          fromPartial<NormalizedVisit>({ date: '2024-04-07' }),
        ], 'yellow'),
      },
    ],
  ])('renders chart with expected data', (visitsGroups) => {
    const { container } = setUp({ visitsGroups });
    expect(container).toMatchSnapshot();
  });

  // FIXME Skipping this test, as testing mouse events in recharts is utterly complex and inconsistent
  //       See https://github.com/recharts/recharts/discussions/6178#discussioncomment-15110851
  it.skip.each([
    // Left to right
    { selectionStart: 100, selectionEnd: 300 },
    // Right to left
    { selectionStart: 300, selectionEnd: 100 },
  ])('allows date range to be selected via drag and drop', async ({ selectionStart, selectionEnd }) => {
    const { chart, user } = setUpChartWithData();

    // An initial click is needed for subsequent events to receive the proper state from recharts
    // See https://github.com/recharts/recharts/discussions/6178#discussioncomment-14029671
    await user.click(chart);

    fireEvent.mouseDown(chart, { clientX: selectionStart, clientY: 200, button: 0 });
    fireEvent.mouseMove(chart, { clientX: selectionEnd, clientY: 200 });
    fireEvent.mouseUp(chart, { clientX: selectionEnd, clientY: 200 });

    expect(onDateRangeChange).toHaveBeenCalled();

    // Regardless of the selection direction, the oldest date will always be used as start date
    const [{ startDate, endDate }] = onDateRangeChange.mock.lastCall as [StrictDateRange];
    expect(isBeforeOrEqual(startDate, endDate)).toBe(true);
  });

  it.each([
    { button: 1 },
    { button: 2 },
  ])('does not select a date range when clicking with a button other than main one', ({ button }) => {
    const { chart } = setUpChartWithData();

    fireEvent.mouseDown(chart, { clientX: 100, clientY: 200, button });
    fireEvent.mouseMove(chart, { clientX: 300, clientY: 200 });
    fireEvent.mouseUp(chart, { clientX: 300, clientY: 200 });

    expect(onDateRangeChange).not.toHaveBeenCalled();
  });

  it('allows chart to be expanded', async () => {
    const { user } = setUpChartWithData();
    const card = screen.getByTestId('line-chart-card');

    expect(card).not.toHaveClass('fixed');
    await user.click(screen.getByLabelText('Expand'));
    expect(card).toHaveClass('fixed');
  });

  it('collapses chart when pressing Escape while expanded', async () => {
    const { user } = setUpChartWithData();
    const card = screen.getByTestId('line-chart-card');

    await user.click(screen.getByLabelText('Expand'));
    expect(card).toHaveClass('fixed');
    await user.keyboard('{Escape}');
    expect(card).not.toHaveClass('fixed');
  });
});
