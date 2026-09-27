import { fromPartial } from '@total-typescript/shoehorn';
import { rangeOf } from '../../../src/utils/helpers';
import { LineChartLegend } from '../../../src/visits/charts/LineChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<LineChartLegend />', () => {
  const setUp = ({ emptyVisits = false }: { emptyVisits?: boolean } = {}) =>
    render(
      <LineChartLegend
        visitsGroups={
          emptyVisits
            ? {}
            : {
                red: rangeOf(3, () => fromPartial({})),
                green: rangeOf(5, () => fromPartial({})),
                blue: [],
                yellow: rangeOf(1322, () => fromPartial({})),
              }
        }
      />,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders no list when entries are empty', async () => {
    const { container } = await setUp({ emptyVisits: true });
    await expect.element(container).toBeEmptyDOMElement();
  });

  it('renders every entry with their corresponding amount', async () => {
    const screen = await setUp();

    expect(screen.getByRole('listitem').all()).toHaveLength(4);
    await Promise.all([
      expect.element(screen.getByText(/^red/)).toHaveTextContent('red (3)'),
      expect.element(screen.getByText(/^green/)).toHaveTextContent('green (5)'),
      expect.element(screen.getByText(/^blue/)).toHaveTextContent('blue (0)'),
      expect.element(screen.getByText(/^yellow/)).toHaveTextContent('yellow (1,322)'),
    ]);
  });
});
