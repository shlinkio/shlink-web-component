import { Card, formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSetting } from '../settings';
import type { CreateShortUrlProps } from '../short-urls/CreateShortUrl';
import { ITEMS_IN_OVERVIEW_PAGE, useUrlsList } from '../short-urls/reducers/shortUrlsList';
import type { ShortUrlsTableType } from '../short-urls/ShortUrlsTable';
import type { TagsList } from '../tags/reducers/tagsList';
import { useRoutesPrefix } from '../utils/routesPrefix';
import type { VisitsOverview } from '../visits/reducers/visitsOverview';
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

type OverviewProps = {
  tagsList: TagsList;
  visitsOverview: VisitsOverview;
  loadVisitsOverview: () => void;
};

type OverviewDeps = {
  ShortUrlsTable: ShortUrlsTableType;
  CreateShortUrl: FC<CreateShortUrlProps>;
};

const Overview: FCWithDeps<OverviewProps, OverviewDeps> = boundToMercureHub((
  { tagsList, loadVisitsOverview, visitsOverview },
) => {
  const { ShortUrlsTable, CreateShortUrl } = useDependencies(Overview);
  const { shortUrlsList, listShortUrls } = useUrlsList();
  const { loading, shortUrls } = shortUrlsList;
  const loadingTags = tagsList.status === 'loading';
  const { loading: loadingVisits, nonOrphanVisits, orphanVisits } = visitsOverview;
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
          {loading ? 'Loading...' : formatNumber(shortUrls?.pagination.totalItems ?? 0)}
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

export const OverviewFactory = componentFactory(Overview, ['ShortUrlsTable', 'CreateShortUrl']);
