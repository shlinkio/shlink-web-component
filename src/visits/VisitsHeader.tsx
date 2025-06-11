import { SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { ShlinkShortUrl, ShlinkVisit } from '../api-contract';
import { ShortUrlVisitsCount } from '../short-urls/helpers/ShortUrlVisitsCount';
import { GoBackButton } from '../utils/components/GoBackButton';

type VisitsHeaderProps = PropsWithChildren<{
  visits: ShlinkVisit[];
  title: ReactNode;
  shortUrl?: ShlinkShortUrl;
}>;

export const VisitsHeader: FC<VisitsHeaderProps> = ({ visits, shortUrl, children, title }) => (
  <header>
    <SimpleCard>
      <h2 className="tw:flex tw:justify-between tw:items-center">
        <GoBackButton />
        <span className="tw:text-center tw:hidden tw:sm:block">
          <small>{title}</small>
        </span>
        <span
          className={clsx(
            'tw:px-3 tw:py-1.5 tw:rounded-md tw:ml-3',
            'tw:font-bold tw:text-white tw:text-2xl',
            'tw:bg-lm-main tw:dark:bg-dm-main',
          )}
          data-testid="badge"
        >
          Visits:{' '}
          <ShortUrlVisitsCount visitsCount={visits.length} shortUrl={shortUrl} />
        </span>
      </h2>
      <h3 className="tw:text-center tw:block tw:sm:hidden tw:mt-3">
        <small>{title}</small>
      </h3>

      {children && <div className="tw:md:mt-3">{children}</div>}
    </SimpleCard>
  </header>
);
