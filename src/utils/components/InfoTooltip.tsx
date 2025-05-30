import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Placement } from '@popperjs/core';
import type { FC, PropsWithChildren, RefObject } from 'react';
import { useRef } from 'react';
import { UncontrolledTooltip } from 'reactstrap';

export type InfoTooltipProps = PropsWithChildren<{
  className?: string;
  placement: Placement;
}>;

export const InfoTooltip: FC<InfoTooltipProps> = ({ className, placement, children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span className={className} ref={ref}>
        <FontAwesomeIcon icon={infoIcon} />
      </span>
      <UncontrolledTooltip target={ref as RefObject<HTMLSpanElement>} placement={placement}>
        {children}
      </UncontrolledTooltip>
    </>
  );
};
