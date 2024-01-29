import { ToggleSwitch, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { ChartCard } from './ChartCard';
import type { DoughnutChartProps } from './DoughnutChart';
import { DoughnutChart } from './DoughnutChart';

type DoughnutChartCardProps = Omit<DoughnutChartProps, 'showNumbersInLegend'> & {
  title: string;
};

export const DoughnutChartCard: FC<DoughnutChartCardProps> = ({ title, ...rest }) => {
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
      <DoughnutChart {...rest} showNumbersInLegend={showNumbersInLegend} />
    </ChartCard>
  );
};
