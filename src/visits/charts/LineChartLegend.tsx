import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import { forwardRef , useMemo } from 'react';
import { ColorBullet } from '../../utils/components/ColorBullet';
import type { VisitsList } from './LineChartCard';
import { visitsListColor } from './LineChartCard';

export type LineChartLegendProps = {
  visitsGroups: Record<string, VisitsList>;
};

export const LineChartLegend = forwardRef<HTMLUListElement, LineChartLegendProps>(({ visitsGroups }, ref) => {
  const entries = useMemo(() => Object.entries(visitsGroups), [visitsGroups]);
  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-4" ref={ref}>
      {entries.map(([value, list], index) => (
        <li className="inline" key={`${value}${index}`}>
          <ColorBullet color={visitsListColor(list)} />
          <strong>{value} ({formatNumber(list.length)})</strong>
        </li>
      ))}
    </ul>
  );
});
