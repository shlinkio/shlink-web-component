import type { Placement } from '@floating-ui/react';
import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';

export type InfoTooltipProps = PropsWithChildren<{
  className?: string;
  placement?: Placement;
}>;

export const InfoTooltip: FC<InfoTooltipProps> = ({ className, placement, children }) => {
  const { anchor, tooltip } = useTooltip({ placement });
  return (
    <>
      <span className={className} {...anchor} data-placement={placement} data-testid="tooltip-anchor">
        <FontAwesomeIcon icon={infoIcon} />
      </span>
      <Tooltip {...tooltip}>{children}</Tooltip>
    </>
  );
};
