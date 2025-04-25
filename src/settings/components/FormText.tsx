import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';

export type FormTextProps = PropsWithChildren<{
  className?: string;
}>;

export const FormText: FC<FormTextProps> = ({ children, className }) => (
  <small className={clsx('tw:mt-1 tw:text-gray-500 tw:block', className)}>{children}</small>
);
