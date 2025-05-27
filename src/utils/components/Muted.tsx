import type { Size } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, HTMLProps, PropsWithChildren } from 'react';

export type MutedProps = PropsWithChildren & Omit<HTMLProps<HTMLSpanElement>, 'size'> & {
  size?: Size;
};

export const Muted: FC<MutedProps> = ({ className, size, ...rest }) => (
  <span
    className={clsx(
      'tw:text-gray-500 tw:dark:text-gray-400',
      {
        'tw:text-sm': size === 'sm',
        'tw:text-lg': size === 'lg',
      },
      className,
    )}
    {...rest}
  />
);
