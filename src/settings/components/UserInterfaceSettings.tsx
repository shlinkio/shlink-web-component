import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Theme } from '@shlinkio/shlink-frontend-kit';
import { getSystemPreferredTheme, SimpleCard, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useSetting } from '..';
import type { UiSettings } from '../types';

interface UserInterfaceProps {
  updateUiSettings: (settings: UiSettings) => void;

  /* Test seam */
  _matchMedia?: typeof window.matchMedia;
}

export const UserInterfaceSettings: FC<UserInterfaceProps> = ({ updateUiSettings, _matchMedia }) => {
  const ui = useSetting('ui');
  const currentTheme = useMemo(() => ui?.theme ?? getSystemPreferredTheme(_matchMedia), [ui?.theme, _matchMedia]);

  return (
    <SimpleCard title="User interface" className="h-100">
      <FontAwesomeIcon icon={currentTheme === 'dark' ? faMoon : faSun} className="float-end mt-1" />
      <ToggleSwitch
        checked={currentTheme === 'dark'}
        onChange={(useDarkTheme) => {
          const theme: Theme = useDarkTheme ? 'dark' : 'light';
          updateUiSettings({ ...ui, theme });
        }}
      >
        Use dark theme.
      </ToggleSwitch>
    </SimpleCard>
  );
};
