import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSystemPreferredTheme , SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useSetting } from '..';
import type { UiSettings } from '../types';
import { LabelledToggle } from './fe-kit/LabelledToggle';

interface UserInterfaceProps {
  onChange: (settings: UiSettings) => void;

  /* Test seam */
  _matchMedia?: typeof window.matchMedia;
}

export const UserInterfaceSettings: FC<UserInterfaceProps> = ({ onChange, _matchMedia }) => {
  const ui = useSetting('ui');
  const currentTheme = useMemo(() => ui?.theme ?? getSystemPreferredTheme(_matchMedia), [ui?.theme, _matchMedia]);

  return (
    <SimpleCard title="User interface" bodyClassName="flex justify-between items-center">
      <LabelledToggle
        checked={currentTheme === 'dark'}
        onChange={(useDarkTheme) => onChange({ ...ui, theme: useDarkTheme ? 'dark' : 'light' })}
      >
        Use dark theme.
      </LabelledToggle>
      <FontAwesomeIcon icon={currentTheme === 'dark' ? faMoon : faSun} />
    </SimpleCard>
  );
};
