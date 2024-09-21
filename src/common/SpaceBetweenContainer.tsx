import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type SpaceBetweenContainerProps = PropsWithChildren & { className?: string };

export const SpaceBetweenContainer: FC<SpaceBetweenContainerProps> = ({ children, className }) => (
  <div className={clsx('d-flex justify-content-between align-items-center', className)}>
    {children}
  </div>
);
