import { ToggleSwitch, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { Stats } from '../types';
import { ChartCard } from './ChartCard';
import { DoughnutChart } from './DoughnutChart';

interface DoughnutChartCardProps {
  title: string;
  stats: Stats;

  /** Test seam. For tests, a responsive container cannot be used */
  dimensions?: { width: number; height: number };
}

export const DoughnutChartCard: FC<DoughnutChartCardProps> = ({ title, stats, dimensions }) => {
  const [showNumbersInLegend, toggleShowNumbersInLegend] = useToggle(false);

  return (
    <ChartCard
      title={(
        <>
          {title}
          <div className="float-end">
            <ToggleSwitch checked={showNumbersInLegend} onChange={toggleShowNumbersInLegend}>
              Show numbers
            </ToggleSwitch>
          </div>
        </>
      )}
    >
      <DoughnutChart stats={stats} showNumbersInLegend={showNumbersInLegend} dimensions={dimensions} />
    </ChartCard>
  );
};
