import { Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Row } from 'reactstrap';
import type { ShlinkShortUrlsListParams } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useSetting } from '../settings';
import type { CreateShortUrlProps } from '../short-urls/CreateShortUrl';
import type { ShortUrlsList as ShortUrlsListState } from '../short-urls/reducers/shortUrlsList';
import { ITEMS_IN_OVERVIEW_PAGE } from '../short-urls/reducers/shortUrlsList';
import type { ShortUrlsTableType } from '../short-urls/ShortUrlsTable';
import type { TagsList } from '../tags/reducers/tagsList';
import { prettify } from '../utils/helpers/numbers';
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
    <Card.Header className="tw:flex tw:justify-between tw:items-center">
      <span className="tw:sm:hidden">{title}</span>
      <h5 className="tw:hidden tw:sm:inline">{title}</h5>
      <Link to={titleLink}>{titleLinkText} &raquo;</Link>
    </Card.Header>
    <Card.Body>
      {children}
    </Card.Body>
  </Card>
);

type OverviewProps = MercureBoundProps & {
  shortUrlsList: ShortUrlsListState;
  listShortUrls: (params: ShlinkShortUrlsListParams) => void;
  tagsList: TagsList;
  visitsOverview: VisitsOverview;
  loadVisitsOverview: () => void;
};

type OverviewDeps = {
  ShortUrlsTable: ShortUrlsTableType;
  CreateShortUrl: FC<CreateShortUrlProps>;
};

const Overview: FCWithDeps<OverviewProps, OverviewDeps> = boundToMercureHub(({
  shortUrlsList,
  listShortUrls,
  tagsList,
  loadVisitsOverview,
  visitsOverview,
}) => {
  const { ShortUrlsTable, CreateShortUrl } = useDependencies(Overview);
  const { loading, shortUrls } = shortUrlsList;
  const { loading: loadingTags } = tagsList;
  const { loading: loadingVisits, nonOrphanVisits, orphanVisits } = visitsOverview;
  const routesPrefix = useRoutesPrefix();
  const navigate = useNavigate();
  const visits = useSetting('visits');

  useEffect(() => {
    listShortUrls({ itemsPerPage: ITEMS_IN_OVERVIEW_PAGE, orderBy: { field: 'dateCreated', dir: 'DESC' } });
    loadVisitsOverview();
  }, [listShortUrls, loadVisitsOverview]);

  return (
    <>
      <Row>
        <div className="col-lg-6 col-xl-3 mb-3">
          <VisitsHighlightCard
            title="Visits"
            link={`${routesPrefix}/non-orphan-visits`}
            excludeBots={visits?.excludeBots ?? false}
            loading={loadingVisits}
            visitsSummary={nonOrphanVisits}
          />
        </div>
        <div className="col-lg-6 col-xl-3 mb-3">
          <VisitsHighlightCard
            title="Orphan visits"
            link={`${routesPrefix}/orphan-visits`}
            excludeBots={visits?.excludeBots ?? false}
            loading={loadingVisits}
            visitsSummary={orphanVisits}
          />
        </div>
        <div className="col-lg-6 col-xl-3 mb-3">
          <HighlightCard title="Short URLs" link={`${routesPrefix}/list-short-urls/1`}>
            {loading ? 'Loading...' : prettify(shortUrls?.pagination.totalItems ?? 0)}
          </HighlightCard>
        </div>
        <div className="col-lg-6 col-xl-3 mb-3">
          <HighlightCard title="Tags" link={`${routesPrefix}/manage-tags`}>
            {loadingTags ? 'Loading...' : prettify(tagsList.tags.length)}
          </HighlightCard>
        </div>
      </Row>

      <div className="d-flex flex-column gap-3">
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
    </>
  );
}, () => [Topics.visits, Topics.orphanVisits]);

export const OverviewFactory = componentFactory(Overview, ['ShortUrlsTable', 'CreateShortUrl']);
