import { faBars as burgerIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AsideMenu } from './common/AsideMenu';
import type { FCWithDeps } from './container/utils';
import { componentFactory, useDependencies } from './container/utils';
import { useFeature } from './utils/features';
import { useSwipeable } from './utils/helpers/hooks';
import { useRoutesPrefix } from './utils/routesPrefix';
import './Main.scss';

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
  } = useDependencies(Main);
  const location = useLocation();
  const routesPrefix = useRoutesPrefix();

  const [sidebarVisible, toggleSidebar, showSidebar, hideSidebar] = useToggle();
  useEffect(() => hideSidebar(), [location]);

  const addDomainVisitsRoute = useFeature('domainVisits');
  const burgerClasses = classNames('shlink-layout__burger-icon', { 'shlink-layout__burger-icon--active': sidebarVisible });
  const swipeableProps = useSwipeable(showSidebar, hideSidebar);

  return (
    <>
      <FontAwesomeIcon icon={burgerIcon} className={burgerClasses} onClick={toggleSidebar} />

      <div {...swipeableProps} className="shlink-layout__swipeable">
        <div className="shlink-layout__swipeable-inner">
          <AsideMenu routePrefix={routesPrefix} showOnMobile={sidebarVisible} />
          <div className="shlink-layout__container" onPointerDown={() => hideSidebar()}>
            <div className="container-xl">
              <Routes>
                <Route index element={<Navigate replace to="overview" />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/list-short-urls/:page" element={<ShortUrlsList />} />
                <Route path="/create-short-url" element={<CreateShortUrl />} />
                <Route path="/short-code/:shortCode/visits/*" element={<ShortUrlVisits />} />
                <Route path="/short-code/:shortCode/edit" element={<EditShortUrl />} />
                <Route path="/tag/:tag/visits/*" element={<TagVisits />} />
                {addDomainVisitsRoute && <Route path="/domain/:domain/visits/*" element={<DomainVisits />} />}
                <Route path="/orphan-visits/*" element={<OrphanVisits />} />
                <Route path="/non-orphan-visits/*" element={<NonOrphanVisits />} />
                <Route path="/manage-tags" element={<TagsList />} />
                <Route path="/manage-domains" element={<ManageDomains />} />
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
]);
