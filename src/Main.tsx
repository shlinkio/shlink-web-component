import { faBars as burgerIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { AsideMenu } from './common/AsideMenu';
import type { FCWithDeps } from './container/utils';
import { componentFactory, useDependencies } from './container/utils';
import { UnstyledButton } from './utils/components/UnstyledButton';
import { useFeature } from './utils/features';
import { useSwipeable } from './utils/helpers/hooks';
import { useRoutesPrefix } from './utils/routesPrefix';

export type MainProps = {
  createNotFound?: (nonPrefixedHomePath: string) => ReactNode;
};

type MainDeps = {
  TagsList: FC,
  ShortUrlsList: FC,
  CreateShortUrl: FC,
  ShortUrlVisits: FC,
  TagVisits: FC,
  DomainVisits: FC,
  OrphanVisits: FC,
  NonOrphanVisits: FC,
  Overview: FC,
  EditShortUrl: FC,
  ManageDomains: FC,
  TagVisitsComparison: FC,
  DomainVisitsComparison: FC,
  ShortUrlVisitsComparison: FC,
  ShortUrlRedirectRules: FC,
};

const Main: FCWithDeps<MainProps, MainDeps> = ({ createNotFound }) => {
  const {
    TagsList,
    ShortUrlsList,
    CreateShortUrl,
    ShortUrlVisits,
    TagVisits,
    DomainVisits,
    OrphanVisits,
    NonOrphanVisits,
    Overview,
    EditShortUrl,
    ManageDomains,
    TagVisitsComparison,
    DomainVisitsComparison,
    ShortUrlVisitsComparison,
    ShortUrlRedirectRules,
  } = useDependencies(Main);
  const location = useLocation();
  const routesPrefix = useRoutesPrefix();

  const { flag: sidebarVisible, toggle: toggleSidebar, setToTrue: showSidebar, setToFalse: hideSidebar } = useToggle(
    false,
    true,
  );

  // Hide sidebar every time the route changes
  useEffect(() => hideSidebar(), [location, hideSidebar]);

  const swipeableProps = useSwipeable(showSidebar, hideSidebar);
  const supportsRedirectRules = useFeature('shortUrlRedirectRules');

  return (
    <>
      <UnstyledButton
        aria-label="Toggle sidebar"
        className={clsx(
          'tw:inline-block tw:md:hidden tw:fixed tw:top-4 tw:z-1035 tw:transition-colors',
          {
            'tw:text-white/50': !sidebarVisible,
            'tw:text-white': sidebarVisible,
          },
        )}
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={burgerIcon} size="xl" />
      </UnstyledButton>

      <div {...swipeableProps} className="tw:h-full">
        <div className="tw:h-full">
          <AsideMenu routePrefix={routesPrefix} showOnMobile={sidebarVisible} />
          <div
            className="tw:min-h-full tw:pt-[20px] tw:md:pt-[30px] tw:md:pl-(--aside-menu-width)"
            onPointerDown={hideSidebar}
          >
            <div className="tw:container tw:mx-auto tw:px-3">
              <Routes>
                <Route index element={<Navigate replace to="overview" />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/list-short-urls/:page" element={<ShortUrlsList />} />
                <Route path="/create-short-url" element={<CreateShortUrl />} />
                <Route path="/short-code/:shortCode/visits">
                  {['', '*'].map((path) => <Route key={path} path={path} element={<ShortUrlVisits />} />)}
                </Route>
                <Route path="/short-code/:shortCode/edit" element={<EditShortUrl />} />
                {supportsRedirectRules && (
                  <Route path="/short-code/:shortCode/redirect-rules" element={<ShortUrlRedirectRules />} />
                )}
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
  'TagVisits',
  'DomainVisits',
  'OrphanVisits',
  'NonOrphanVisits',
  'Overview',
  'EditShortUrl',
  'ManageDomains',
  'TagVisitsComparison',
  'DomainVisitsComparison',
  'ShortUrlVisitsComparison',
  'ShortUrlRedirectRules',
]);
