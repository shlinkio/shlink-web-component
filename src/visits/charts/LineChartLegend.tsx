import { formatNumber } from '@shlinkio/shlink-frontend-kit/tailwind';
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
    <ul className="tw:mt-2 tw:flex tw:flex-wrap tw:justify-center tw:gap-4" ref={ref}>
      {entries.map(([value, list], index) => (
        <li className="tw:inline" key={`${value}${index}`}>
          <ColorBullet color={visitsListColor(list)} />
          <strong>{value} ({formatNumber(list.length)})</strong>
        </li>
      ))}
    </ul>
  );
});
