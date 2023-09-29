import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ChartDataset } from 'chart.js';
import type { DoughnutChart } from '../../../src/visits/charts/DoughnutChartLegend';
import { DoughnutChartLegend } from '../../../src/visits/charts/DoughnutChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<DoughnutChartLegend />', () => {
  const labels = ['foo', 'bar', 'baz', 'foo2', 'bar2'];
  const colors = ['green', 'blue', 'yellow'];
  const defaultColor = 'red';
  const datasets = [fromPartial<ChartDataset>({ backgroundColor: colors })];
  const chart = fromPartial<DoughnutChart>({
    config: {
      data: { labels, datasets: datasets as any },
      options: { defaultColor } as any,
    },
  });
  const setUp = () => render(<DoughnutChartLegend chart={chart} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders the expected amount of items with expected colors and labels', () => {
    setUp();

    const items = screen.getAllByRole('listitem');

    expect.assertions(labels.length * 2 + 1);
    expect(items).toHaveLength(labels.length);

    labels.forEach((label, index) => {
      const item = items[index];

      expect(item.querySelector('.doughnut-chart-legend__item-color')).toHaveAttribute(
        'style',
        `background-color: ${colors[index] ?? defaultColor};`,
      );
      expect(item.querySelector('.doughnut-chart-legend__item-text')).toHaveTextContent(label);
    });
  });
});
