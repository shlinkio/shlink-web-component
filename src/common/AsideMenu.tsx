import {
  faGlobe as domainsIcon,
  faHome as overviewIcon,
  faLink as createIcon,
  faList as listIcon,
  faTags as tagsIcon,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import type { FC } from 'react';
import type { NavLinkProps } from 'react-router';
import { NavLink, useLocation } from 'react-router';

export type AsideMenuProps = {
  routePrefix: string;
  showOnMobile?: boolean;
};

type AsideMenuItem = NavLinkProps & {
  active?: boolean;
};

const AsideMenuItem: FC<AsideMenuItem> = ({ children, to, active, ...rest }) => (
  <NavLink
    {...rest}
    className={({ isActive }) => clsx(
      'tw:flex tw:items-center tw:gap-2',
      'tw:no-underline tw:rounded-none tw:px-5 tw:py-2.5',
      {
        'tw:text-white tw:bg-lm-main tw:dark:bg-dm-main': isActive || active,
        'tw:highlight:bg-lm-secondary tw:highlight:dark:bg-dm-secondary': !isActive && !active,
      },
    )}
    to={to}
  >
    {children}
  </NavLink>
);

export const AsideMenu: FC<AsideMenuProps> = ({ routePrefix, showOnMobile = false }) => {
  const { pathname } = useLocation();
  const buildPath = (suffix: string) => `${routePrefix}${suffix}`;

  return (
    <aside
      className={clsx(
        'tw:w-(--aside-menu-width) tw:bg-lm-primary tw:dark:bg-dm-primary',
        'tw:pt-[15px] tw:md:pt-[30px] tw:pb-[10px]',
        'tw:fixed! tw:bottom-0 tw:top-(--header-height) tw:z-1010 tw:transition-[left] tw:duration-300',
        'tw:shadow-aside-menu-mobile tw:md:shadow-aside-menu',
        {
          'tw:left-0': showOnMobile,
          'tw:max-md:left-[calc(-1*(var(--aside-menu-width)+35px))]': !showOnMobile,
        },
      )}
    >
      <nav className="tw:flex tw:flex-col tw:h-full">
        <AsideMenuItem to={buildPath('/overview')}>
          <FontAwesomeIcon fixedWidth icon={overviewIcon} />
          Overview
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/list-short-urls/1')} active={pathname.match('/list-short-urls') !== null}>
          <FontAwesomeIcon fixedWidth icon={listIcon} />
          List short URLs
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/create-short-url')}>
          <FontAwesomeIcon fixedWidth icon={createIcon} flip="horizontal" />
          Create short URL
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/manage-tags')}>
          <FontAwesomeIcon fixedWidth icon={tagsIcon} />
          Manage tags
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/manage-domains')}>
          <FontAwesomeIcon fixedWidth icon={domainsIcon} />
          Manage domains
        </AsideMenuItem>
      </nav>
    </aside>
  );
};
