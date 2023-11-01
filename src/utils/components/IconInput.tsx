import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import type { InputProps } from 'reactstrap';
import { Input } from 'reactstrap';
import './IconInput.scss';

type IconInputProps = InputProps & {
  icon: IconProp;
};

export const IconInput: FC<IconInputProps> = ({ icon, className, ...rest }) => {
  const ref = useElementRef<HTMLInputElement>();

  return (
    <div className="icon-input-container">
      <Input className={clsx('icon-input-container__input', className)} innerRef={ref} {...rest} />
      <FontAwesomeIcon
        icon={icon}
        fixedWidth
        className="icon-input-container__icon"
        onClick={() => ref.current?.focus()}
      />
    </div>
  );
};
