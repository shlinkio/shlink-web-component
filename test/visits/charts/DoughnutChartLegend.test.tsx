import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { DoughnutChartEntry } from '../../../src/visits/charts/DoughnutChart';
import { DoughnutChartLegend } from '../../../src/visits/charts/DoughnutChartLegend';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { hexToRgb } from '../../__helpers__/colors';

describe('<DoughnutChartLegend />', () => {
  const chartData: DoughnutChartEntry[] = [
    fromPartial({ name: 'foo', color: '#008000', value: 5 }),
    fromPartial({ name: 'bar', color: '#000080', value: 4 }),
    fromPartial({ name: 'baz', color: '#ffff00', value: 15 }),
    fromPartial({ name: 'foo2', color: '#008000', value: 8 }),
    fromPartial({ name: 'bar2', color: '#000080', value: 3481 }),
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
      const { r, g, b } = hexToRgb(color);
      expect(screen.getByTestId(`color-bullet-${index}`)).toHaveStyle({
        'background-color': `rgb(${r}, ${g}, ${b})`,
      });
      expect(screen.getByTestId(`name-${index}`)).toHaveTextContent(
        showNumbers ? `${name} (${formatNumber(value)})` : name,
      );
    });
  });
});
