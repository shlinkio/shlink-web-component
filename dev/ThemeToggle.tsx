import type { Theme } from '@shlinkio/shlink-frontend-kit';
import { changeThemeInMarkup } from '@shlinkio/shlink-frontend-kit';
import { Label, ToggleSwitch } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

export const ThemeToggle: FC = () => {
  const [checked, setChecked] = useState(() => {
    const initialTheme = (localStorage.getItem('active_theme') ?? 'light') as Theme;
    changeThemeInMarkup(initialTheme);
    return initialTheme === 'dark';
  });
  const toggleTheme = useCallback((isDarkTheme: boolean) => {
    const newTheme: Theme = isDarkTheme ? 'dark' : 'light';

    setChecked(isDarkTheme);
    changeThemeInMarkup(newTheme);
    localStorage.setItem('active_theme', newTheme);
  }, []);

  return (
    <Label className="tw:flex tw:items-center tw:gap-x-1.5">
      <ToggleSwitch checked={checked} onChange={toggleTheme} /> Dark theme
    </Label>
  );
};
