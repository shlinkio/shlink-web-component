import { Card } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren, ReactNode } from 'react';

type ChartCardProps = PropsWithChildren<{
  title: ReactNode;
  footer?: ReactNode;
}>;

export const ChartCard: FC<ChartCardProps> = ({ title, footer, children }) => (
  <Card role="document">
    <Card.Header>{title}</Card.Header>
    <Card.Body>{children}</Card.Body>
    {footer && <Card.Footer className="sticky bottom-0">{footer}</Card.Footer>}
  </Card>
);
