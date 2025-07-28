import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { InputProps } from '@shlinkio/shlink-frontend-kit';
import { Input } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useRef } from 'react';

export type IconInputProps = InputProps & {
  icon: FontAwesomeIconProps['icon'];
};

export const IconInput: FC<IconInputProps> = ({ icon, className, ...rest }) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Input className={clsx('pr-11', className)} ref={ref} {...rest} />
      <FontAwesomeIcon
        icon={icon}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        onClick={() => ref.current?.focus()}
      />
    </div>
  );
};
