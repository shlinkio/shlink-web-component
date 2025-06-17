import type { Size } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';

export type MutedProps = PropsWithChildren & Omit<HTMLProps<HTMLSpanElement>, 'size'> & {
  size?: Size;
};

export const Muted: FC<MutedProps> = ({ className, size, ...rest }) => (
  <span
    className={clsx(
      'text-gray-500 dark:text-gray-400',
      {
        'text-sm': size === 'sm',
        'text-lg': size === 'lg',
      },
      className,
    )}
    {...rest}
  />
);
