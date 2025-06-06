import { faArrowAltCircleRight as linkIcon } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard, Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router';

export type HighlightCardProps = PropsWithChildren<{
  title: string;
  link: string;
  tooltip?: ReactNode;
}>;

export const HighlightCard: FC<HighlightCardProps> = ({ children, title, link, tooltip: tooltipContent }) => {
  const { anchor, tooltip } = useTooltip({ placement: 'bottom' });

  return (
    <>
      <Link to={link} className="tw:no-underline tw:text-inherit" {...anchor}>
        <SimpleCard
          className={clsx(
            'tw:text-center tw:border-t-3 tw:border-t-lm-main tw:dark:border-t-dm-main tw:relative',
          )}
        >
          <FontAwesomeIcon
            icon={linkIcon}
            size="3x"
            className="tw:absolute tw:right-[5px] tw:bottom-[5px] tw:opacity-10 tw:-rotate-45"
          />
          <div
            role="heading"
            aria-level={5}
            className="tw:text-xl tw:uppercase tw:text-placeholder tw:font-bold tw:mb-2"
          >
            {title}
          </div>
          <div className="tw:text-4xl tw:font-semibold">{children}</div>
        </SimpleCard>
      </Link>
      {tooltipContent && (
        <Tooltip {...tooltip}>{tooltipContent}</Tooltip>
      )}
    </>
  );
};
