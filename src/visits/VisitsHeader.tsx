import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Card } from 'reactstrap';
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
    <Card body>
      <h2 className="d-flex justify-content-between align-items-center mb-0">
        <GoBackButton />
        <span className="text-center d-none d-sm-block">
          <small>{title}</small>
        </span>
        <span className="badge badge-main ms-3">
          Visits:{' '}
          <ShortUrlVisitsCount visitsCount={visits.length} shortUrl={shortUrl} />
        </span>
      </h2>
      <h3 className="text-center d-block d-sm-none mb-0 mt-3">
        <small>{title}</small>
      </h3>

      {children && <div className="mt-md-2">{children}</div>}
    </Card>
  </header>
);
