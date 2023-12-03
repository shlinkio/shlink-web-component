import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, subDays, subMonths, subYears } from 'date-fns';
import { LineChartCard } from '../../../src/visits/recharts/LineChartCard';
import type { NormalizedVisit } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<LineChartCard />', () => {
  const dimensions = { width: 800, height: 400 };
  const setUp = (visits: NormalizedVisit[] = [], highlightedVisits: NormalizedVisit[] = []) => renderWithEvents(
    <LineChartCard title="Cool title" visits={visits} highlightedVisits={highlightedVisits} dimensions={dimensions} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders provided title', () => {
    setUp();
    expect(screen.getByRole('heading')).toHaveTextContent('Cool title');
  });

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
    const { user } = setUp(visits.map((visit) => fromPartial(visit)));

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
    [undefined, undefined],
    [[], []],
    [[fromPartial<NormalizedVisit>({ date: '2016-04-01' })], []],
    [[fromPartial<NormalizedVisit>({ date: '2016-04-01' })], [fromPartial<NormalizedVisit>({ date: '2016-04-01' })]],
  ])('renders chart with expected data', (visits, highlightedVisits) => {
    const { container } = setUp(visits, highlightedVisits);
    expect(container).toMatchSnapshot();
  });
});
