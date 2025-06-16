import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type SpaceBetweenContainerProps = PropsWithChildren & { className?: string };

export const SpaceBetweenContainer: FC<SpaceBetweenContainerProps> = ({ children, className }) => (
  <div className={clsx('flex justify-between items-center', className)}>
    {children}
  </div>
);
