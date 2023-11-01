import { clsx } from 'clsx';
import type { FC, HTMLProps } from 'react';

export const UnstyledButton: FC<Omit<HTMLProps<HTMLButtonElement>, 'type'>> = ({ style, className, ...rest }) => (
  <button
    type="button"
    className={clsx('border-0', className)}
    style={{ backgroundColor: 'inherit', fontWeight: 'inherit', ...style }}
    {...rest}
  />
);
