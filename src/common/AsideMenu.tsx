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
      'flex items-center gap-2',
      'no-underline rounded-none px-5 py-2.5',
      {
        'text-white bg-lm-main dark:bg-dm-main': isActive || active,
        'highlight:bg-lm-secondary highlight:dark:bg-dm-secondary': !isActive && !active,
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
        'w-(--aside-menu-width) bg-lm-primary dark:bg-dm-primary',
        'pt-[15px] md:pt-[30px] pb-[10px]',
        'fixed! bottom-0 top-(--header-height) z-890 transition-[left] duration-300',
        'shadow-aside-menu-mobile md:shadow-aside-menu',
        {
          'left-0': showOnMobile,
          'max-md:left-[calc(-1*(var(--aside-menu-width)+35px))]': !showOnMobile,
        },
      )}
    >
      <nav className="flex flex-col h-full">
        <AsideMenuItem to={buildPath('/overview')}>
          <FontAwesomeIcon icon={overviewIcon} />
          Overview
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/list-short-urls/1')} active={pathname.match('/list-short-urls') !== null}>
          <FontAwesomeIcon icon={listIcon} />
          List short URLs
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/create-short-url')}>
          <FontAwesomeIcon icon={createIcon} flip="horizontal" />
          Create short URL
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/manage-tags')}>
          <FontAwesomeIcon icon={tagsIcon} />
          Manage tags
        </AsideMenuItem>
        <AsideMenuItem to={buildPath('/manage-domains')}>
          <FontAwesomeIcon icon={domainsIcon} />
          Manage domains
        </AsideMenuItem>
      </nav>
    </aside>
  );
};
