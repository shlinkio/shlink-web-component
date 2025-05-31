import { Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, PropsWithChildren, ReactNode } from 'react';

type ChartCardProps = PropsWithChildren<{
  title: ReactNode;
  footer?: ReactNode;
}>;

export const ChartCard: FC<ChartCardProps> = ({ title, footer, children }) => (
  <Card role="document">
    <Card.Header>{title}</Card.Header>
    <Card.Body>{children}</Card.Body>
    {footer && <Card.Footer className="tw:sticky tw:bottom-0">{footer}</Card.Footer>}
  </Card>
);
