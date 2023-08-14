import { changeThemeInMarkup, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

export const ThemeToggle: FC = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    changeThemeInMarkup(checked ? 'dark' : 'light');
  }, [checked]);

  return <ToggleSwitch checked={checked} onChange={setChecked}>Dark theme</ToggleSwitch>;
};
