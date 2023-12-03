import { screen } from '@testing-library/react';
import { DoughnutChart } from '../../../src/visits/recharts/DoughnutChart';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DoughnutChart />', () => {
  const stats = { foo: 123, bar: 456 };
  const dimensions = { width: 800, height: 300 };
  const setUp = () => renderWithEvents(<DoughnutChart stats={stats} dimensions={dimensions} showNumbersInLegend />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders Doughnut with expected props', () => {
    const { container } = setUp();
    expect(container).toMatchSnapshot();
  });

  it('renders expected legend', () => {
    setUp();

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});
