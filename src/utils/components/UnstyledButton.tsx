import classNames from 'classnames';
import type { FC, HTMLProps } from 'react';

export const UnstyledButton: FC<Omit<HTMLProps<HTMLButtonElement>, 'type'>> = ({ style, className, ...rest }) => (
  <button
    type="button"
    className={classNames('border-0', className)}
    style={{ backgroundColor: 'inherit', ...style }}
    {...rest}
  />
);
