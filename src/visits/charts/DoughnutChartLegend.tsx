import type { FC } from 'react';
import { prettify } from '../../utils/helpers/numbers';
import type { DoughnutChartEntry } from './DoughnutChart';
import './DoughnutChartLegend.scss';

type DoughnutChartLegendProps = {
  chartData: DoughnutChartEntry[];
  showNumbers: boolean;
};

export const DoughnutChartLegend: FC<DoughnutChartLegendProps> = ({ chartData, showNumbers }) => (
  <ul className="doughnut-chart-legend">
    {chartData.map(({ name, color, value }) => (
      <li key={name} className="doughnut-chart-legend__item d-flex">
        <div
          className="doughnut-chart-legend__item-color"
          style={{ backgroundColor: color }}
        />
        <small className="doughnut-chart-legend__item-text flex-fill">
          {name}
          {showNumbers && <b> ({prettify(value)})</b>}
        </small>
      </li>
    ))}
  </ul>
);
