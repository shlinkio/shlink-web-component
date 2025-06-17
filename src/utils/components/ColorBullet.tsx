import { clsx } from 'clsx';

export type ColorBulletProps = {
  color: string;
  testId?: string;
};

export const ColorBullet = ({ color, testId }: ColorBulletProps) => (
  <div
    data-testid={testId}
    style={{ backgroundColor: color }}
    className={clsx(
      'inline-block w-[20px] h-[20px] rounded-full',
      'align-[-4px] mr-1.5',
    )}
  />
);
