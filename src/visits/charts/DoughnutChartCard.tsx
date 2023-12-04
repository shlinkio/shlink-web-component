import { ToggleSwitch, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { Stats } from '../types';
import { ChartCard } from './ChartCard';
import { DoughnutChart } from './DoughnutChart';

interface DoughnutChartCardProps {
  title: string;
  stats: Stats;
}

export const DoughnutChartCard: FC<DoughnutChartCardProps> = ({ title, stats }) => {
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
      <DoughnutChart stats={stats} showNumbersInLegend={showNumbersInLegend} />
    </ChartCard>
  );
};
