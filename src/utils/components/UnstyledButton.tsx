import { clsx } from 'clsx';
import type { FC, HTMLProps } from 'react';

export const UnstyledButton: FC<Omit<HTMLProps<HTMLButtonElement>, 'type'>> = ({ className, ...rest }) => (
  <button
    type="button"
    className={clsx('tw:rounded-sm tw:focus-ring', className)}
    {...rest}
  />
);
