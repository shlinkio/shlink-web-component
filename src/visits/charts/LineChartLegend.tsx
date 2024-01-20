import type { FC } from 'react';
import { useMemo } from 'react';
import { ColorBullet } from '../../utils/components/ColorBullet';
import { prettify } from '../../utils/helpers/numbers';
import type { VisitsList } from './LineChartCard';
import { visitsListColor } from './LineChartCard';

export type LineChartLegendProps = {
  visitsGroups: Record<string, VisitsList>;
};

export const LineChartLegend: FC<LineChartLegendProps> = ({ visitsGroups }) => {
  const entries = useMemo(() => Object.entries(visitsGroups), [visitsGroups]);
  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="list-unstyled mb-0 mt-2 d-flex flex-wrap justify-content-center gap-3">
      {entries.map(([value, list], index) => (
        <li className="d-inline" key={`${value}${index}`}>
          <ColorBullet color={visitsListColor(list)} />
          <strong>{value} ({prettify(list.length)})</strong>
        </li>
      ))}
    </ul>
  );
};
