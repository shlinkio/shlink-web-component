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
    [{ foo: 123, bar: 456 }, undefined, undefined],
    [{ one: 999, two: 131313 }, { one: 30, two: 100 }, undefined],
    [{ one: 999, two: 131313, max: 3 }, { one: 30, two: 100 }, undefined],
    [{ one: 40, two: 300, three: 35 }, { one: 30, two: 100, three: 35 }, undefined],
    [{ one: 40, two: 300, three: 35 }, { one: 30, two: 100, three: 35 }, { one: 20, two: 500, three: 8 }],
    [{ one: 40, two: 300, three: 35 }, undefined, { one: 20, two: 500, three: 8 }],
  ])('renders expected charts and tooltip', (stats, highlightedStats, prevStats) => {
    const { container } = setUp({ stats, highlightedStats, prevStats });
    expect(container).toMatchSnapshot();
  });
});
