import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { prettify } from '../../../src/utils/helpers/numbers';
import type { DoughnutChartEntry } from '../../../src/visits/recharts/DoughnutChart';
import { DoughnutChartLegend } from '../../../src/visits/recharts/DoughnutChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<DoughnutChartLegend />', () => {
  const chartData: DoughnutChartEntry[] = [
    fromPartial({ name: 'foo', color: 'green', value: 5 }),
    fromPartial({ name: 'bar', color: 'blue', value: 4 }),
    fromPartial({ name: 'baz', color: 'yellow', value: 15 }),
    fromPartial({ name: 'foo2', color: 'green', value: 8 }),
    fromPartial({ name: 'bar2', color: 'blue', value: 3481 }),
  ];
  const setUp = (showNumbers = false) => render(
    <DoughnutChartLegend chartData={chartData} showNumbers={showNumbers} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([[true], [false]])('renders the expected amount of items with expected colors and labels', (showNumbers) => {
    setUp(showNumbers);

    const items = screen.getAllByRole('listitem');

    expect.assertions(chartData.length * 2 + 1);
    expect(items).toHaveLength(chartData.length);

    chartData.forEach(({ name, color, value }, index) => {
      const item = items[index];

      expect(item.querySelector('.doughnut-chart-legend__item-color')).toHaveAttribute(
        'style',
        `background-color: ${color};`,
      );
      expect(item.querySelector('.doughnut-chart-legend__item-text')).toHaveTextContent(
        showNumbers ? `${name} (${prettify(value)})` : name,
      );
    });
  });
});
