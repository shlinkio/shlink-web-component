import { Card, formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import type { ShlinkVisitsSummary } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSetting } from '../settings';
import type { CreateShortUrlProps } from '../short-urls/CreateShortUrl';
import { ITEMS_IN_OVERVIEW_PAGE, useUrlsList } from '../short-urls/reducers/shortUrlsList';
import { ShortUrlsTable } from '../short-urls/ShortUrlsTable';
import { useTagsList } from '../tags/reducers/tagsList';
import { useRoutesPrefix } from '../utils/routesPrefix';
import { useVisitsOverview } from '../visits/reducers/visitsOverview';
import { HighlightCard } from './helpers/HighlightCard';
import { VisitsHighlightCard } from './helpers/VisitsHighlightCard';

type OverviewCardProps = {
  children: ReactNode;
  title: string;
  titleLink: string;
  titleLinkText: string;
};

const OverviewCard: FC<OverviewCardProps> = ({ children, titleLinkText, titleLink, title }) => (
  <Card className="card">
    <Card.Header className="flex justify-between items-center">
      <span className="sm:hidden">{title}</span>
      <h5 className="hidden sm:inline">{title}</h5>
      <Link to={titleLink}>{titleLinkText} &raquo;</Link>
    </Card.Header>
    <Card.Body>
      {children}
    </Card.Body>
  </Card>
);

type OverviewDeps = {
  CreateShortUrl: FC<CreateShortUrlProps>;
};

const visitsSummaryFallback: ShlinkVisitsSummary = { total: 0, bots: 0, nonBots: 0 };

const Overview: FCWithDeps<any, OverviewDeps> = boundToMercureHub(() => {
  const { CreateShortUrl } = useDependencies(Overview);
  const { shortUrlsList, listShortUrls } = useUrlsList();
  const { loadVisitsOverview, visitsOverview } = useVisitsOverview();
  const loadingVisits = visitsOverview.status === 'loading';
  const { orphanVisits, nonOrphanVisits } = visitsOverview.status === 'loaded' ? visitsOverview : {
    orphanVisits: visitsSummaryFallback,
    nonOrphanVisits: visitsSummaryFallback,
  };
  const { tagsList } = useTagsList();
  const loadingTags = tagsList.status === 'loading';
  const routesPrefix = useRoutesPrefix();
  const navigate = useNavigate();
  const visits = useSetting('visits');

  useEffect(() => {
    listShortUrls({
      itemsPerPage: ITEMS_IN_OVERVIEW_PAGE,
      orderBy: { field: 'dateCreated', dir: 'DESC' },
    });
    loadVisitsOverview();
  }, [listShortUrls, loadVisitsOverview]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <VisitsHighlightCard
          title="Visits"
          link={`${routesPrefix}/non-orphan-visits`}
          excludeBots={visits?.excludeBots ?? false}
          loading={loadingVisits}
          visitsSummary={nonOrphanVisits}
        />
        <VisitsHighlightCard
          title="Orphan visits"
          link={`${routesPrefix}/orphan-visits`}
          excludeBots={visits?.excludeBots ?? false}
          loading={loadingVisits}
          visitsSummary={orphanVisits}
        />
        <HighlightCard title="Short URLs" link={`${routesPrefix}/list-short-urls/1`}>
          {shortUrlsList.status === 'loading' && 'Loading...'}
          {shortUrlsList.status === 'loaded' && formatNumber(shortUrlsList.shortUrls.pagination.totalItems)}
        </HighlightCard>
        <HighlightCard title="Tags" link={`${routesPrefix}/manage-tags`}>
          {loadingTags ? 'Loading...' : formatNumber(tagsList.tags.length)}
        </HighlightCard>
      </div>

      <OverviewCard
        title="Create a short URL"
        titleLinkText="Advanced options"
        titleLink={`${routesPrefix}/create-short-url`}
      >
        <CreateShortUrl basicMode />
      </OverviewCard>

      <OverviewCard
        title="Recently created URLs"
        titleLinkText="See all"
        titleLink={`${routesPrefix}/list-short-urls/1`}
      >
        <ShortUrlsTable
          shortUrlsList={shortUrlsList}
          onTagClick={(tag) => navigate(`${routesPrefix}/list-short-urls/1?tags=${encodeURIComponent(tag)}`)}
        />
      </OverviewCard>
    </div>
  );
}, () => [Topics.visits, Topics.orphanVisits]);

export const OverviewFactory = componentFactory(Overview, ['CreateShortUrl']);
