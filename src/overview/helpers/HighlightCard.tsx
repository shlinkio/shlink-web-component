import { faArrowAltCircleRight as linkIcon } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard, Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit';
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
      <Link to={link} className="no-underline text-inherit" {...anchor}>
        <SimpleCard
          className={clsx(
            'text-center border-t-3 border-t-lm-main dark:border-t-dm-main relative',
          )}
        >
          <FontAwesomeIcon
            icon={linkIcon}
            size="3x"
            className="absolute right-[5px] bottom-[5px] opacity-10 -rotate-45"
          />
          <div
            role="heading"
            aria-level={5}
            className="text-xl uppercase text-placeholder font-bold mb-2"
          >
            {title}
          </div>
          <div className="text-4xl font-semibold">{children}</div>
        </SimpleCard>
      </Link>
      {tooltipContent && (
        <Tooltip {...tooltip}>{tooltipContent}</Tooltip>
      )}
    </>
  );
};
