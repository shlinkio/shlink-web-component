import { screen } from '@testing-library/react';
import { ChartDimensionsProvider } from '../../../src/visits/charts/ChartDimensionsContext';
import { DoughnutChart } from '../../../src/visits/charts/DoughnutChart';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DoughnutChart />', () => {
  const stats = { foo: 123, bar: 456 };
  const setUp = (prevStats = {}) => renderWithEvents(
    <ChartDimensionsProvider value={{ width: 800, height: 300 }}>
      <DoughnutChart stats={stats} prevStats={prevStats} showNumbersInLegend />
    </ChartDimensionsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [{}],
    [{ foo: 300, baz: 33 }],
    [{ ...stats, baz: 20 }],
  ])('renders Doughnut with expected props', (prevStats) => {
    const { container } = setUp(prevStats);
    expect(container).toMatchSnapshot();
  });

  it('renders expected legend', () => {
    setUp();

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});
