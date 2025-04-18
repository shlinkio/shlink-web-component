import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSystemPreferredTheme, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useSetting } from '..';
import type { UiSettings } from '../types';

interface UserInterfaceProps {
  onChange: (settings: UiSettings) => void;

  /* Test seam */
  _matchMedia?: typeof window.matchMedia;
}

export const UserInterfaceSettings: FC<UserInterfaceProps> = ({ onChange, _matchMedia }) => {
  const ui = useSetting('ui');
  const currentTheme = useMemo(() => ui?.theme ?? getSystemPreferredTheme(_matchMedia), [ui?.theme, _matchMedia]);

  return (
    <SimpleCard title="User interface" className="h-100" bodyClassName="d-flex justify-content-between align-items-center">
      <ToggleSwitch
        checked={currentTheme === 'dark'}
        onChange={(useDarkTheme) => onChange({ ...ui, theme: useDarkTheme ? 'dark' : 'light' })}
      >
        Use dark theme.
      </ToggleSwitch>
      <FontAwesomeIcon icon={currentTheme === 'dark' ? faMoon : faSun} />
    </SimpleCard>
  );
};
