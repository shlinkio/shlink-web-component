import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, subDays, subMonths, subYears } from 'date-fns';
import type { VisitsList } from '../../../src/visits/charts/LineChartCard';
import { LineChartCard } from '../../../src/visits/charts/LineChartCard';
import type { NormalizedVisit } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<LineChartCard />', () => {
  const dimensions = { width: 800, height: 400 };
  const setUp = (visitsGroups: Record<string, VisitsList> = {}) => renderWithEvents(
    <LineChartCard visitsGroups={visitsGroups} dimensions={dimensions} />,
  );
  const asMainVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(visits, { type: 'main' as const });
  const asHighlightedVisits = (visits: NormalizedVisit[]): VisitsList => Object.assign(
    visits,
    { type: 'highlighted' as const },
  );

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
    const { user } = setUp({ v: asMainVisits(visits.map((visit) => fromPartial(visit))) });

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
    [{ v: asMainVisits([]), h: asHighlightedVisits([]) }],
    [{ v: asMainVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]), h: asHighlightedVisits([]) }],
    [{
      v: asMainVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]),
      h: asHighlightedVisits([fromPartial<NormalizedVisit>({ date: '2016-04-01' })]),
    }],
  ])('renders chart with expected data', (visitsGroups) => {
    const { container } = setUp(visitsGroups);
    expect(container).toMatchSnapshot();
  });
});
