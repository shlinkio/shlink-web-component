import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
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
      <h2 className="flex justify-between items-center">
        <GoBackButton />
        <span className="text-center hidden sm:block">
          <small>{title}</small>
        </span>
        <span
          className={clsx(
            'px-3 py-1.5 rounded-md ml-3',
            'font-bold text-white text-2xl',
            'bg-lm-main dark:bg-dm-main',
          )}
          data-testid="badge"
        >
          Visits:{' '}
          <ShortUrlVisitsCount visitsCount={visits.length} shortUrl={shortUrl} />
        </span>
      </h2>
      <h3 className="text-center block sm:hidden mt-3">
        <small>{title}</small>
      </h3>

      {children && <div className="md:mt-3">{children}</div>}
    </SimpleCard>
  </header>
);
