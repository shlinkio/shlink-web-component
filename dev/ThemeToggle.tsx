import { changeThemeInMarkup, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

export const ThemeToggle: FC = () => {
  const query = useMemo(() => new URLSearchParams(location.search), []);
  const [checked, setChecked] = useState(query.get('theme') === 'dark');

  useEffect(() => {
    const theme = checked ? 'dark' : 'light';
    changeThemeInMarkup(theme);
    query.set('theme', theme);
    history.pushState({}, '', `?${query}`);
  }, [checked]);

  return <ToggleSwitch checked={checked} onChange={setChecked}>Dark theme</ToggleSwitch>;
};
