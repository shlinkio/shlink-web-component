import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap';
import './ChartCard.scss';

type ChartCardProps = PropsWithChildren<{
  title: ReactNode;
  footer?: ReactNode;
}>;

export const ChartCard: FC<ChartCardProps> = ({ title, footer, children }) => (
  <Card role="document">
    <CardHeader className="chart-card__header">{title}</CardHeader>
    <CardBody>{children}</CardBody>
    {footer && <CardFooter className="chart-card__footer--sticky">{footer}</CardFooter>}
  </Card>
);
