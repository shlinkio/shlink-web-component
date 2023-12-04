import { screen } from '@testing-library/react';
import { DoughnutChartCard } from '../../../src/visits/charts/DoughnutChartCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DoughnutChartCard />', () => {
  const stats = { foo: 10, bar: 5602 };
  const dimensions = { width: 800, height: 400 };
  const setUp = () => renderWithEvents(<DoughnutChartCard title="Stats" stats={stats} dimensions={dimensions} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('allows amounts to be toggled from legend', async () => {
    const { user } = setUp();
    const listItemsBefore = screen.getAllByRole('listitem');

    expect(listItemsBefore[0]).toHaveTextContent('foo');
    expect(listItemsBefore[1]).toHaveTextContent('bar');
    expect(listItemsBefore[0]).not.toHaveTextContent('foo (10)');
    expect(listItemsBefore[1]).not.toHaveTextContent('bar (5,602)');

    await user.click(screen.getByLabelText('Show numbers'));
    const listItemsAfter = screen.getAllByRole('listitem');

    expect(listItemsAfter[0]).toHaveTextContent('foo (10)');
    expect(listItemsAfter[1]).toHaveTextContent('bar (5,602)');
  });
});
