import type { HorizontalBarChartProps } from '../../../src/visits/charts/HorizontalBarChart';
import { HorizontalBarChart } from '../../../src/visits/charts/HorizontalBarChart';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<HorizontalBarChart />', () => {
  const setUp = (props: Omit<HorizontalBarChartProps, 'dimensions'>) => renderWithEvents(
    <HorizontalBarChart {...props} dimensions={{ width: 800, height: 400 }} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({ stats: {} })));

  it.each([
    [{ foo: 123, bar: 456 }, undefined],
    [{ one: 999, two: 131313 }, { one: 30, two: 100 }],
    [{ one: 999, two: 131313, max: 3 }, { one: 30, two: 100 }],
  ])('renders chart with expected canvas', (stats, highlightedStats) => {
    const { container } = setUp({ stats, highlightedStats });
    expect(container).toMatchSnapshot();
  });
});
