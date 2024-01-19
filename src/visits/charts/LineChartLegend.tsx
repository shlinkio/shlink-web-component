import type { FC } from 'react';
import { ColorBullet } from '../../utils/components/ColorBullet';
import { prettify } from '../../utils/helpers/numbers';

type ChartEntry = {
  value: string;
  color?: string;
};

export type LineChartLegendProps = {
  visitsGroups: Record<string, unknown[]>;
  entries?: ChartEntry[];
};

export const LineChartLegend: FC<LineChartLegendProps> = ({ entries = [], visitsGroups }) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="list-unstyled mb-0 mt-2 d-flex flex-wrap justify-content-center gap-3">
      {entries.map(({ value, color = '' }, index) => (
        <li className="d-inline" key={`${value}${index}`}>
          <ColorBullet color={color} />
          <strong>{value} ({prettify(visitsGroups[value]?.length ?? 0)})</strong>
        </li>
      ))}
    </ul>
  );
};
