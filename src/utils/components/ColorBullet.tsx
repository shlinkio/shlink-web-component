import { clsx } from 'clsx';

export type ColorBulletProps = {
  color: string;
};

export const ColorBullet = ({ color }: ColorBulletProps) => (
  <div
    style={{ backgroundColor: color }}
    className={clsx(
      'tw:inline-block tw:w-[20px] tw:h-[20px] tw:rounded-full',
      'tw:align-[-4px] tw:mr-1.5',
    )}
  />
);
