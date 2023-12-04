import {
  HIGHLIGHTED_COLOR,
  HIGHLIGHTED_COLOR_ALPHA,
  isDarkThemeEnabled,
  MAIN_COLOR,
  MAIN_COLOR_ALPHA,
} from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Fragment, useMemo } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { prettify } from '../../utils/helpers/numbers';
import type { Stats } from '../types';
import { CHART_TOOLTIP_STYLES } from './constants';

export type HorizontalBarChartProps = {
  stats: Stats;
  max?: number;
  highlightedStats?: Stats;
  highlightedLabel?: string;
  onClick?: (label: string) => void;

  /** Test seam. For tests, a responsive container cannot be used */
  dimensions?: { width: number; height: number };
};

type HorizontalBarChartEntry = {
  name: string;
  amount: number | null;
  highlightedAmount: number;
};

export const HorizontalBarChart: FC<HorizontalBarChartProps> = (
  { stats, highlightedStats, highlightedLabel, max, onClick, dimensions },
) => {
  const chartData = useMemo((): HorizontalBarChartEntry[] => Object.entries(stats).map(([name, amount]) => {
    const highlightedAmount = highlightedStats?.[name] ?? 0;
    return {
      // Setting value `null` on "hidden" elements allows for them to be excluded from tooltips
      amount: name.startsWith('hidden_') ? null : amount - highlightedAmount,
      highlightedAmount,
      name,
    };
  }), [stats, highlightedStats]);
  const height = useMemo(() => Math.max(300, chartData.length * 22), [chartData]);

  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;
  const wrapperDimensions = dimensions ? {} : { width: '100%', height };

  return (
    <ChartWrapper {...wrapperDimensions}>
      {/* Using a ComposedChart instead of a PieChart because they have a more subtle hover effect */}
      <ComposedChart layout="vertical" data={chartData} barCategoryGap={3} {...dimensions}>
        <XAxis
          type="number"
          dataKey="amount"
          tickFormatter={prettify}
          domain={max ? [0, max] : undefined}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100 /* TODO Make this dynamic based on max length of names, falling back to a maximum value */}
          interval={0}
          style={{ fontSize: '.8rem' /* TODO Add text ellipsis for too long names */ }}
          tickFormatter={(value) => (value.startsWith('hidden_') ? '' : value)}
        />
        <CartesianGrid strokeOpacity={isDarkThemeEnabled() ? 0.05 : 0.9} />
        <Tooltip
          filterNull // This will prevent "hidden" values to render a tooltip
          contentStyle={CHART_TOOLTIP_STYLES}
          formatter={(value: number, name: keyof HorizontalBarChartEntry) => {
            const prettifiedValue = prettify(value);
            if (name === 'highlightedAmount') {
              return [prettifiedValue, highlightedLabel];
            }

            return [prettifiedValue, highlightedStats ? 'Non-selected' : 'Visits'];
          }}
        />
        <Bar
          dataKey="amount"
          stackId="main"
          cursor="pointer"
          fill={MAIN_COLOR /* This needs to be set as it is the color used in the tooltip */}
          onClick={({ name }: HorizontalBarChartEntry) => onClick?.(name)}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={MAIN_COLOR_ALPHA} stroke={MAIN_COLOR} strokeWidth={2} />
          ))}
        </Bar>
        {highlightedStats && (
          <Bar
            dataKey="highlightedAmount"
            stackId="main"
            cursor="pointer"
            fill={HIGHLIGHTED_COLOR /* This needs to be set as it is the color used in the tooltip */}
            onClick={({ name }: HorizontalBarChartEntry) => onClick?.(name)}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={HIGHLIGHTED_COLOR_ALPHA} stroke={HIGHLIGHTED_COLOR} strokeWidth={2} />
            ))}
          </Bar>
        )}
      </ComposedChart>
    </ChartWrapper>
  );
};
