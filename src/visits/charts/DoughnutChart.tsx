import { isDarkThemeEnabled, PRIMARY_DARK_COLOR, PRIMARY_LIGHT_COLOR } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { chartTooltipFormatter } from '../../utils/helpers';
import type { Stats } from '../types';
import { useChartDimensions } from './ChartDimensionsContext';
import { CHART_TOOLTIP_STYLES, chartColorForIndex, prevColor } from './constants';
import { DoughnutChartLegend } from './DoughnutChartLegend';

export type DoughnutChartProps = {
  stats: Stats;
  prevStats: Stats;
  showNumbersInLegend: boolean;
};

export type DoughnutChartEntry = {
  name: string;
  value: number;
  color: string;
};

const useChartData = (stats: Stats): DoughnutChartEntry[] => useMemo(
  () => Object.entries(stats).map(([name, value], i) => ({ name, value, color: chartColorForIndex(i) })),
  [stats],
);

export const DoughnutChart: FC<DoughnutChartProps> = ({ stats, prevStats, showNumbersInLegend }) => {
  const chartData = useChartData(stats);
  const prevChartData = useChartData(prevStats);
  const hasPrevCharts = prevChartData.length > 0;
  const borderColor = isDarkThemeEnabled() ? PRIMARY_DARK_COLOR : PRIMARY_LIGHT_COLOR;
  const { ChartWrapper, dimensions, wrapperDimensions } = useChartDimensions(300);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-y-4">
      <div className="md:flex-7">
        <div style={wrapperDimensions}>
          <ChartWrapper>
            <PieChart {...dimensions}>
              <Tooltip
                formatter={chartTooltipFormatter}
                contentStyle={CHART_TOOLTIP_STYLES}
                itemStyle={{ color: 'white' }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                startAngle={360}
                endAngle={0}
                outerRadius="100%"
                innerRadius={hasPrevCharts ? '65%' : '50%'}
                animationBegin={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} stroke={borderColor} />
                ))}
              </Pie>
              {hasPrevCharts && (
                <Pie
                  data={prevChartData}
                  dataKey="value"
                  nameKey="name"
                  startAngle={360}
                  endAngle={0}
                  outerRadius="55%"
                  innerRadius="20%"
                  animationBegin={0}
                  stroke={borderColor}
                  fill={prevColor()}
                />
              )}
            </PieChart>
          </ChartWrapper>
        </div>
      </div>
      <div className="md:flex-5">
        <DoughnutChartLegend chartData={chartData} showNumbers={showNumbersInLegend} />
      </div>
    </div>
  );
};
