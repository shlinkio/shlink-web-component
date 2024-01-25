import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, subDays, subMonths, subYears } from 'date-fns';
import type { VisitsList } from '../../../src/visits/charts/LineChartCard';
import { LineChartCard } from '../../../src/visits/charts/LineChartCard';
import type { NormalizedVisit } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  visitsGroups?: Record<string, VisitsList>;
};

describe('<LineChartCard />', () => {
  const dimensions = { width: 800, height: 400 };
  const setUp = ({ visitsGroups = {} }: SetUpOptions = {}) => renderWithEvents(
    <LineChartCard visitsGroups={visitsGroups} dimensions={dimensions} />,
  );
  const asMainVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(visits, { type: 'main' as const });
  const asHighlightedVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(
    visits,
    { type: 'highlighted' as const },
  );
  const asPrevVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(visits, { type: 'previous' as const });
  const asColoredVisits = (visits: NormalizedVisit[], color: string): VisitsList => Object.assign(visits, { color });

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
    expect(items[expectedActiveIndex]).toHaveClass('active');
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
});
