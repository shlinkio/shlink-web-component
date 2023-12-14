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
  amount: number;
  nonHighlightedAmount: number | null;
  highlightedAmount: number | null;
};

const isHiddenLabel = (label: string) => label.startsWith('hidden_');

export const HorizontalBarChart: FC<HorizontalBarChartProps> = (
  { stats, highlightedStats, highlightedLabel, max, onClick, dimensions },
) => {
  const chartData = useMemo((): HorizontalBarChartEntry[] => Object.entries(stats).map(([name, amount]) => {
    const highlightedAmount = highlightedStats?.[name] ?? 0;
    const isHidden = isHiddenLabel(name);

    return {
      name,
      amount,
      // Setting value `null` on "hidden" elements allows for them to be excluded from tooltips
      nonHighlightedAmount: isHidden ? null : amount - highlightedAmount,
      highlightedAmount: isHidden ? null : highlightedAmount,
    };
  }), [stats, highlightedStats]);
  const verticalAxisWidth = useMemo(() => {
    const longestNameLength = chartData.reduce((prev, { name }) => (prev > name.length ? prev : name.length), 0);
    // Set a size of around 7 times the longest text, unless it exceeds a maximum of 150
    return Math.min(150, longestNameLength * 7);
  }, [chartData]);

  const ChartWrapper = dimensions ? Fragment : ResponsiveContainer;
  const wrapperDimensions = useMemo(() => {
    // The wrapper should have no dimensions if explicit dimensions were provided to be used on the chart
    if (dimensions) {
      return {};
    }

    const height = Math.max(300, chartData.length * 22);
    return { width: '100%', height };
  }, [dimensions, chartData]);

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
          width={verticalAxisWidth}
          interval={0}
          style={{ fontSize: '.8rem' /* TODO: Should show text overflow ellipsis */ }}
          tickFormatter={(label) => (isHiddenLabel(label) ? '' : label)}
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
          dataKey="nonHighlightedAmount"
          stackId="main"
          cursor="pointer"
          fill={MAIN_COLOR /* This needs to be set as it is the color used in the tooltip */}
          onClick={({ name }: HorizontalBarChartEntry) => onClick?.(name)}
        >
          {chartData.map((entry) => (
            // Using a Cell, to define a different fill color, without affecting the one used for the tooltip
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
