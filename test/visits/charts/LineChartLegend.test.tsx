import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { rangeOf } from '../../../src/utils/helpers';
import { LineChartLegend } from '../../../src/visits/charts/LineChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<LineChartLegend />', () => {
  const setUp = ({ emptyVisits = false }: { emptyVisits?: boolean } = {}) => render(
    <LineChartLegend
      visitsGroups={emptyVisits ? {} : {
        red: rangeOf(3, () => fromPartial({})),
        green: rangeOf(5, () => fromPartial({})),
        blue: [],
        yellow: rangeOf(1322, () => fromPartial({})),
      }}
    />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders no list when entries are empty', () => {
    const { container } = setUp({ emptyVisits: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders every entry with their corresponding amount', () => {
    setUp();

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByText(/^red/)).toHaveTextContent('red (3)');
    expect(screen.queryByText(/^green/)).toHaveTextContent('green (5)');
    expect(screen.queryByText(/^blue/)).toHaveTextContent('blue (0)');
    expect(screen.queryByText(/^yellow/)).toHaveTextContent('yellow (1,322)');
  });
});
