import { isDarkThemeEnabled, PRIMARY_DARK_COLOR, PRIMARY_LIGHT_COLOR } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Fragment, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { prettify } from '../../utils/helpers/numbers';
import type { Stats } from '../types';
import { CHART_TOOLTIP_STYLES, COLORS } from './constants';
import { DoughnutChartLegend } from './DoughnutChartLegend';

export type DoughnutChartProps = {
  stats: Stats;
  showNumbersInLegend: boolean;

  /** Test seam. For tests, a responsive container cannot be used */
  dimensions?: { width: number; height: number };
};

export type DoughnutChartEntry = {
  name: string;
  value: number;
  color: string;
};

export const DoughnutChart: FC<DoughnutChartProps> = ({ stats, showNumbersInLegend, dimensions }) => {
  const chartData = useMemo((): DoughnutChartEntry[] => Object.entries(stats).map(([name, value], index) => (
    { name, value, color: COLORS[index % COLORS.length] }
  )), [stats]);
  const borderColor = isDarkThemeEnabled() ? PRIMARY_DARK_COLOR : PRIMARY_LIGHT_COLOR;
  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;

  return (
    <div className="row align-items-center">
      <div className="col-sm-12 col-md-7">
        <div style={dimensions ?? { width: '100%', height: 300 }}>
          <ChartWrapper>
            <PieChart {...dimensions}>
              <Tooltip formatter={prettify} contentStyle={CHART_TOOLTIP_STYLES} itemStyle={{ color: 'white' }} />
              <Pie data={chartData} dataKey="value" nameKey="name" startAngle={360} endAngle={0} outerRadius="100%" innerRadius="50%">
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} stroke={borderColor} />
                ))}
              </Pie>
            </PieChart>
          </ChartWrapper>
        </div>
      </div>
      <div className="col-sm-12 col-md-5">
        <DoughnutChartLegend chartData={chartData} showNumbers={showNumbersInLegend} />
      </div>
    </div>
  );
};
