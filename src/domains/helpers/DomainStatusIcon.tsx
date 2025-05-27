import {
  faCheck as checkIcon,
  faCircleNotch as loadingStatusIcon,
  faTimes as invalidIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import type { FC, RefObject } from 'react';
import { useRef } from 'react';
import { ExternalLink } from 'react-external-link';
import { UncontrolledTooltip } from 'reactstrap';
import { useMaxResolution } from '../../utils/helpers/hooks';
import type { MediaMatcher } from '../../utils/types';
import type { DomainStatus } from '../data';

interface DomainStatusIconProps {
  status: DomainStatus;
  matchMedia?: MediaMatcher;
}

export const DomainStatusIcon: FC<DomainStatusIconProps> = ({ status, matchMedia = window.matchMedia }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isMobile = useMaxResolution(991, matchMedia);

  if (status === 'validating') {
    return <FontAwesomeIcon fixedWidth icon={loadingStatusIcon} spin />;
  }

  return (
    <>
      <span ref={ref}>
        <FontAwesomeIcon
          fixedWidth
          icon={status === 'valid' ? checkIcon : invalidIcon}
          className={clsx({ 'tw:text-danger': status !== 'valid' })}
        />
      </span>
      <UncontrolledTooltip
        target={ref as RefObject<HTMLSpanElement>}
        placement={isMobile ? 'right' : 'left'}
        autohide={status === 'valid'}
      >
        {status === 'valid' ? 'Congratulations! This domain is properly configured.' : (
          <span>
            Oops! There is some missing configuration, and short URLs shared with this domain will not work.
            <br />
            Check the <ExternalLink href="https://slnk.to/multi-domain-docs">documentation</ExternalLink> in order to
            find out what is missing.
          </span>
        )}
      </UncontrolledTooltip>
    </>
  );
};
