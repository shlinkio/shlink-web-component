import { changeThemeInMarkup, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

export const ThemeToggle: FC = () => {
  const [checked, setChecked] = useState(localStorage.getItem('active_theme') === 'dark');

  useEffect(() => {
    const theme = checked ? 'dark' : 'light';
    changeThemeInMarkup(theme);
    localStorage.setItem('active_theme', theme);
  }, [checked]);

  return <ToggleSwitch checked={checked} onChange={setChecked}>Dark theme</ToggleSwitch>;
};
