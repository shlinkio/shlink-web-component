import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { AsideMenu } from './common/AsideMenu';
import type { FCWithDeps } from './container/utils';
import { componentFactory, useDependencies } from './container/utils';
import { ManageDomains } from './domains/ManageDomains';
import { ShortUrlRedirectRules } from './redirect-rules/ShortUrlRedirectRules';
import { ShlinkSidebarToggleButton } from './sidebar/ShlinkSidebarToggleButton';
import { useSidebarVisibility } from './sidebar/ShlinkSidebarVisibilityProvider';
import { useSwipeable } from './utils/helpers/hooks';
import { useRoutesPrefix } from './utils/routesPrefix';
import { TagVisits } from './visits/TagVisits';
import { DomainVisitsComparison } from './visits/visits-comparison/DomainVisitsComparison';
import { ShortUrlVisitsComparison } from './visits/visits-comparison/ShortUrlVisitsComparison';
import { TagVisitsComparison } from './visits/visits-comparison/TagVisitsComparison';

export type MainProps = {
  createNotFound?: (nonPrefixedHomePath: string) => ReactNode;
  autoToggleButton: boolean;
};

type MainDeps = {
  TagsList: FC,
  ShortUrlsList: FC,
  CreateShortUrl: FC,
  ShortUrlVisits: FC,
  DomainVisits: FC,
  OrphanVisits: FC,
  NonOrphanVisits: FC,
  Overview: FC,
  EditShortUrl: FC,
};

const Main: FCWithDeps<MainProps, MainDeps> = ({ createNotFound, autoToggleButton }) => {
  const {
    TagsList,
    ShortUrlsList,
    CreateShortUrl,
    ShortUrlVisits,
    DomainVisits,
    OrphanVisits,
    NonOrphanVisits,
    Overview,
    EditShortUrl,
  } = useDependencies(Main);
  const location = useLocation();
  const routesPrefix = useRoutesPrefix();

  const { sidebarVisible, showSidebar, hideSidebar } = useSidebarVisibility()!;

  // Hide sidebar every time the route changes
  useEffect(() => hideSidebar(), [location, hideSidebar]);

  const swipeableProps = useSwipeable(showSidebar, hideSidebar);

  return (
    <>
      {autoToggleButton && <ShlinkSidebarToggleButton className="fixed top-4 left-3 z-1035" />}

      <div {...swipeableProps} className="h-full">
        <div className="h-full">
          <AsideMenu routePrefix={routesPrefix} showOnMobile={sidebarVisible} />
          <div
            className="min-h-full pt-[20px] md:pt-[30px] md:pl-(--aside-menu-width)"
            onPointerDown={hideSidebar}
          >
            <div className="container mx-auto px-3">
              <Routes>
                <Route index element={<Navigate replace to="overview" />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/list-short-urls/:page" element={<ShortUrlsList />} />
                <Route path="/create-short-url" element={<CreateShortUrl />} />
                <Route path="/short-code/:shortCode/visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<ShortUrlVisits />} />)}
                </Route>
                <Route path="/short-code/:shortCode/edit" element={<EditShortUrl />} />
                <Route path="/short-code/:shortCode/redirect-rules" element={<ShortUrlRedirectRules />} />
                <Route path="/short-urls/compare-visits" element={<ShortUrlVisitsComparison />} />
                <Route path="/tag/:tag/visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<TagVisits />} />)}
                </Route>
                <Route path="/tags/compare-visits" element={<TagVisitsComparison />} />
                <Route path="/domain/:domain/visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<DomainVisits />} />)}
                </Route>
                <Route path="/orphan-visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<OrphanVisits />} />)}
                </Route>
                <Route path="/non-orphan-visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<NonOrphanVisits />} />)}
                </Route>
                <Route path="/manage-tags" element={<TagsList />} />
                <Route path="/manage-domains" element={<ManageDomains />} />
                <Route path="/domains/compare-visits" element={<DomainVisitsComparison />} />
                {createNotFound && <Route path="*" element={createNotFound('/list-short-urls/1')} />}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const MainFactory = componentFactory(Main, [
  'TagsList',
  'ShortUrlsList',
  'CreateShortUrl',
  'ShortUrlVisits',
  'DomainVisits',
  'OrphanVisits',
  'NonOrphanVisits',
  'Overview',
  'EditShortUrl',
]);
