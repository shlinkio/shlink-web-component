import { clsx } from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';

export type FormTextProps = HTMLProps<HTMLElement> & PropsWithChildren<{
  className?: string;
}>;

export const FormText: FC<FormTextProps> = ({ children, className, ...rest }) => (
  <small className={clsx('tw:mt-1 tw:text-gray-500 tw:block', className)} {...rest}>{children}</small>
);
