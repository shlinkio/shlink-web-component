import { ChartDimensionsProvider } from '../../../src/visits/charts/ChartDimensionsContext';
import { DoughnutChartCard } from '../../../src/visits/charts/DoughnutChartCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DoughnutChartCard />', () => {
  const stats = { foo: 10, bar: 5602 };
  const setUp = () =>
    renderWithEvents(
      <ChartDimensionsProvider value={{ width: 800, height: 400 }}>
        <DoughnutChartCard title="Stats" stats={stats} prevStats={{}} />
      </ChartDimensionsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('allows amounts to be toggled from legend', async () => {
    const { user, ...screen } = await setUp();
    const listItemsBefore = screen.getByRole('listitem').all();

    await Promise.all([
      expect.element(listItemsBefore[0]).toHaveTextContent('foo'),
      expect.element(listItemsBefore[1]).toHaveTextContent('bar'),
      expect.element(listItemsBefore[0]).not.toHaveTextContent('foo (10)'),
      expect.element(listItemsBefore[1]).not.toHaveTextContent('bar (5,602)'),
    ]);

    await user.click(screen.getByLabelText('Show numbers'));
    const listItemsAfter = screen.getByRole('listitem').all();

    await Promise.all([
      expect.element(listItemsAfter[0]).toHaveTextContent('foo (10)'),
      expect.element(listItemsAfter[1]).toHaveTextContent('bar (5,602)'),
    ]);
  });
});
