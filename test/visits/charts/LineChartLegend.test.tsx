import { render, screen } from '@testing-library/react';
import type { LineChartLegendProps } from '../../../src/visits/charts/LineChartLegend';
import { LineChartLegend } from '../../../src/visits/charts/LineChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<LineChartLegend />', () => {
  const setUp = ({ visitsGroups = {}, entries }: Partial<LineChartLegendProps> = {}) => render(
    <LineChartLegend visitsGroups={visitsGroups} entries={entries} />,
  );
  const createEntries = (...values: string[]) => values.map((value) => ({ value, color: value }));

  it('passes a11y checks', () => checkAccessibility(setUp({
    entries: createEntries('red', 'green', 'blue'),
  })));

  it.each([
    [undefined],
    [[]],
  ])('renders no list when entries are empty', (entries) => {
    const { container } = setUp({ entries });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders every entry with their corresponding amount', () => {
    setUp({
      entries: createEntries('red', 'green', 'blue', 'yellow'),
      visitsGroups: {
        red: [1, 2, 3],
        green: [1, 2, 3, 4, 5],
        blue: [],
      },
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByText(/^red/)).toHaveTextContent('red (3)');
    expect(screen.queryByText(/^green/)).toHaveTextContent('green (5)');
    expect(screen.queryByText(/^blue/)).toHaveTextContent('blue (0)');
    expect(screen.queryByText(/^yellow/)).toHaveTextContent('yellow (0)');
  });
});
