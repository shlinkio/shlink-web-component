import {
  faCheck as checkIcon,
  faCircleNotch as loadingStatusIcon,
  faTimes as invalidIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { ExternalLink } from 'react-external-link';
import type { DomainStatus } from '../data';

interface DomainStatusIconProps {
  status: DomainStatus;
}

export const DomainStatusIcon: FC<DomainStatusIconProps> = ({ status }) => {
  const { anchor, tooltip } = useTooltip();

  if (status === 'validating') {
    return <FontAwesomeIcon fixedWidth icon={loadingStatusIcon} spin />;
  }

  return (
    <span {...anchor}>
      <FontAwesomeIcon
        fixedWidth
        icon={status === 'valid' ? checkIcon : invalidIcon}
        className={clsx({ 'text-danger': status !== 'valid' })}
      />
      <Tooltip {...tooltip}>
        {status === 'valid' ? (
          <>
            Congratulations!
            <br />
            This domain is properly configured.
          </>
        ) : (
          <span>
            Oops! There is some missing configuration, and short URLs shared with this domain will not work.
            <br />
            Check the <ExternalLink href="https://slnk.to/multi-domain-docs">documentation</ExternalLink> in order to
            find out what is missing.
          </span>
        )}
      </Tooltip>
    </span>
  );
};
