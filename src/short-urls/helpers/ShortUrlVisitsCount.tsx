import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { RefObject } from 'react';
import { useRef } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import type { ShlinkShortUrl } from '../../api-contract';
import { formatHumanFriendly, parseISO } from '../../utils/dates/helpers/date';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';

interface ShortUrlVisitsCountProps {
  shortUrl?: ShlinkShortUrl | null;
  visitsCount: number;
  active?: boolean;
  asLink?: boolean;
}

export const ShortUrlVisitsCount = (
  { visitsCount, shortUrl, active = false, asLink = false }: ShortUrlVisitsCountProps,
) => {
  const tooltipRef = useRef<HTMLElement>(null);
  const { maxVisits, validSince, validUntil } = shortUrl?.meta ?? {};
  const hasLimit = !!maxVisits || !!validSince || !!validUntil;
  const visitsLink = (
    <ShortUrlDetailLink shortUrl={shortUrl} suffix="visits" asLink={asLink}>
      <strong className={clsx('tw:inline-block tw:transition-all tw:duration-300', { 'tw:scale-150': active })}>
        {formatNumber(visitsCount)}
      </strong>
    </ShortUrlDetailLink>
  );

  if (!hasLimit) {
    return visitsLink;
  }

  return (
    <>
      <span className="tw:whitespace-nowrap">
        {visitsLink}
        <small className="tw:cursor-help" ref={tooltipRef}>
          {maxVisits && <> / {formatNumber(maxVisits)}</>}
          <sup className="tw:ml-1">
            <FontAwesomeIcon icon={infoIcon} />
          </sup>
        </small>
      </span>
      <UncontrolledTooltip target={tooltipRef as RefObject<HTMLElement>} placement="bottom">
        <ul className="tw:p-0 tw:m-0 tw:flex tw:flex-col tw:gap-y-2">
          {maxVisits && (
            <li>
              This short URL will not accept more than <b>{formatNumber(maxVisits)}</b> visit{maxVisits === 1 ? '' : 's'}.
            </li>
          )}
          {validSince && (
            <li>
              This short URL will not accept visits
              before <b className="tw:whitespace-nowrap">{formatHumanFriendly(parseISO(validSince))}</b>.
            </li>
          )}
          {validUntil && (
            <li>
              This short URL will not accept visits
              after <b className="tw:whitespace-nowrap">{formatHumanFriendly(parseISO(validUntil))}</b>.
            </li>
          )}
        </ul>
      </UncontrolledTooltip>
    </>
  );
};
