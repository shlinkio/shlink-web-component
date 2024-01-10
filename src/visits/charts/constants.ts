import type { CSSProperties } from 'react';

export const CHART_TOOLTIP_STYLES: CSSProperties = {
  color: 'white',
  background: 'rgb(0 0 0 / .9)',
  border: 'none',
  borderRadius: '5px',
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
