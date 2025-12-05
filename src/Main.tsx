import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { AsideMenu } from './common/AsideMenu';
import { ManageDomains } from './domains/ManageDomains';
import { useDomainsList } from './domains/reducers/domainsList';
import { useMercureInfo } from './mercure/reducers/mercureInfo';
import { Overview } from './overview/Overview';
import { ShortUrlRedirectRules } from './redirect-rules/ShortUrlRedirectRules';
import { CreateShortUrl } from './short-urls/CreateShortUrl';
import { EditShortUrl } from './short-urls/EditShortUrl';
import { ShortUrlsList } from './short-urls/ShortUrlsList';
import { ShlinkSidebarToggleButton } from './sidebar/ShlinkSidebarToggleButton';
import { useSidebarVisibility } from './sidebar/ShlinkSidebarVisibilityProvider';
import { useTagsList } from './tags/reducers/tagsList';
import { TagsList } from './tags/TagsList';
import { useSwipeable } from './utils/helpers/hooks';
import { useRoutesPrefix } from './utils/routesPrefix';
import { DomainVisits } from './visits/DomainVisits';
import { NonOrphanVisits } from './visits/NonOrphanVisits';
import { OrphanVisits } from './visits/OrphanVisits';
import { ShortUrlVisits } from './visits/ShortUrlVisits';
import { TagVisits } from './visits/TagVisits';
import { DomainVisitsComparison } from './visits/visits-comparison/DomainVisitsComparison';
import { ShortUrlVisitsComparison } from './visits/visits-comparison/ShortUrlVisitsComparison';
import { TagVisitsComparison } from './visits/visits-comparison/TagVisitsComparison';

export type MainProps = {
  createNotFound?: (nonPrefixedHomePath: string) => ReactNode;
  autoToggleButton: boolean;
};

export const Main: FC<MainProps> = ({ createNotFound, autoToggleButton }) => {
  const location = useLocation();
  const routesPrefix = useRoutesPrefix();

  // Load some initial information that is shared by many components
  const { loadMercureInfo } = useMercureInfo();
  const { listTags } = useTagsList();
  const { listDomains } = useDomainsList();
  useEffect(() => {
    loadMercureInfo();
    listTags();
    listDomains();
  }, [listDomains, listTags, loadMercureInfo]);

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
