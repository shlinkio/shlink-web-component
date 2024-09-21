import { ToggleSwitch, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { SpaceBetweenContainer } from '../../common/SpaceBetweenContainer';
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
        <SpaceBetweenContainer>
          {title}
          <div>
            <ToggleSwitch checked={showNumbersInLegend} onChange={toggleShowNumbersInLegend}>
              Show numbers
            </ToggleSwitch>
          </div>
        </SpaceBetweenContainer>
      )}
    >
      <DoughnutChart {...rest} showNumbersInLegend={showNumbersInLegend} />
    </ChartCard>
  );
};
