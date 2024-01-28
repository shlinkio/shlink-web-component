import type { CSSProperties } from 'react';
import type { TooltipProps } from 'recharts';

export const CHART_TOOLTIP_STYLES: CSSProperties = {
  color: 'white',
  background: 'rgb(0 0 0 / .9)',
  border: 'none',
  borderRadius: '5px',
} as const;

const CHART_TOOLTIP_LABEL_STYLES: CSSProperties = {
  marginBottom: '5px',
  fontWeight: 'bold',
} as const;

export const CHART_TOOLTIP_COMMON_PROPS: Pick<TooltipProps<any, any>, 'contentStyle' | 'labelStyle' | 'itemStyle'> = {
  contentStyle: CHART_TOOLTIP_STYLES,
  labelStyle: CHART_TOOLTIP_LABEL_STYLES,
  itemStyle: { padding: 0 },
} as const;

const COLORS = [
  '#97BBCD',
  '#F7464A',
  '#46BFBD',
  '#FDB45C',
  '#949FB1',
  '#57A773',
  '#414066',
  '#08B2E3',
  '#B6C454',
  '#DCDCDC',
  '#463730',
] as const;

export const chartColorForIndex = (index: number) => COLORS[index % COLORS.length];

export const PREV_COLOR = '#46e587';

export const PREV_COLOR_ALPHA = 'rgba(70, 229, 135, 0.4)';
