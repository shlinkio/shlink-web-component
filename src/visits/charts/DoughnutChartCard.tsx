import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { SpaceBetweenContainer } from '../../common/SpaceBetweenContainer';
import { LabelledToggle } from '../../settings/components/fe-kit/LabelledToggle';
import { ChartCard } from './ChartCard';
import type { DoughnutChartProps } from './DoughnutChart';
import { DoughnutChart } from './DoughnutChart';

type DoughnutChartCardProps = Omit<DoughnutChartProps, 'showNumbersInLegend'> & {
  title: string;
};

export const DoughnutChartCard: FC<DoughnutChartCardProps> = ({ title, ...rest }) => {
  const { flag: showNumbersInLegend, toggle: toggleShowNumbersInLegend } = useToggle(false, true);

  return (
    <ChartCard
      title={(
        <SpaceBetweenContainer>
          {title}
          <LabelledToggle checked={showNumbersInLegend} onChange={toggleShowNumbersInLegend}>
            Show numbers
          </LabelledToggle>
        </SpaceBetweenContainer>
      )}
    >
      <DoughnutChart {...rest} showNumbersInLegend={showNumbersInLegend} />
    </ChartCard>
  );
};
