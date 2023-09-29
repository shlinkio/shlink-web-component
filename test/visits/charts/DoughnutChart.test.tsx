import { screen } from '@testing-library/react';
import { DoughnutChart } from '../../../src/visits/charts/DoughnutChart';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { setUpCanvas } from '../../__helpers__/setUpTest';

describe('<DoughnutChart />', () => {
  const stats = {
    foo: 123,
    bar: 456,
  };
  const setUp = () => setUpCanvas(<DoughnutChart label="This is a chart" stats={stats} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders Doughnut with expected props', () => {
    const { events } = setUp();

    expect(events).toBeTruthy();
    expect(events).toMatchSnapshot();
  });

  it('renders expected legend', () => {
    setUp();

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});
