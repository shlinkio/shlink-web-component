import { mergeDeepRight } from '@shlinkio/data-manipulation';
import { NavPillItem, NavPills } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';
import { Children } from 'react';
import { useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { DeepPartial } from '../../utils/types';
import { SettingsProvider } from '..';
import type { RealTimeUpdatesSettings, Settings, ShortUrlsListSettings } from '../types';
import { RealTimeUpdatesSettings as RealTimeUpdates } from './RealTimeUpdatesSettings';
import { ShortUrlCreationSettings as ShortUrlCreation } from './ShortUrlCreationSettings';
import { ShortUrlsListSettings as ShortUrlsList } from './ShortUrlsListSettings';
import { TagsSettings as Tags } from './TagsSettings';
import { UserInterfaceSettings } from './UserInterfaceSettings';
import { VisitsSettings as Visits } from './VisitsSettings';

export type ShlinkWebSettingsProps = {
  settings: Settings;
  defaultShortUrlsListOrdering: NonNullable<ShortUrlsListSettings['defaultOrdering']>;
  updateSettings: (settings: Settings) => void;
};

const SettingsSections: FC<PropsWithChildren> = ({ children }) => Children.map(
  children,
  (child, index) => <div key={index} className="mb-3">{child}</div>,
);

export const ShlinkWebSettings: FC<ShlinkWebSettingsProps> = (
  { settings, updateSettings, defaultShortUrlsListOrdering },
) => {
  const updatePartialSettings = useCallback(
    (partialSettings: DeepPartial<Settings>) => updateSettings(mergeDeepRight(settings, partialSettings)),
    [settings, updateSettings],
  );
  const toggleRealTimeUpdates = useCallback(
    (enabled: boolean) => updatePartialSettings({ realTimeUpdates: { enabled } }),
    [updatePartialSettings],
  );
  const setRealTimeUpdatesInterval = useCallback(
    (interval: number) => updatePartialSettings({ realTimeUpdates: { interval } as RealTimeUpdatesSettings }),
    [updatePartialSettings],
  );
  const updateSettingsProp = useCallback(
    <Prop extends keyof Settings>(prop: Prop, value: Settings[Prop]) => updatePartialSettings({ [prop]: value }),
    [updatePartialSettings],
  );

  return (
    <SettingsProvider value={settings}>
      <NavPills className="mb-3">
        <NavPillItem to="general">General</NavPillItem>
        <NavPillItem to="short-urls">Short URLs</NavPillItem>
        <NavPillItem to="other-items">Other items</NavPillItem>
      </NavPills>

      <Routes>
        <Route
          path="general"
          element={(
            <SettingsSections>
              <UserInterfaceSettings updateUiSettings={(v) => updateSettingsProp('ui', v)} />
              <RealTimeUpdates
                toggleRealTimeUpdates={toggleRealTimeUpdates}
                setRealTimeUpdatesInterval={setRealTimeUpdatesInterval}
              />
            </SettingsSections>
          )}
        />
        <Route
          path="short-urls"
          element={(
            <SettingsSections>
              <ShortUrlCreation updateShortUrlCreationSettings={(v) => updateSettingsProp('shortUrlCreation', v)} />
              <ShortUrlsList
                defaultOrdering={defaultShortUrlsListOrdering}
                updateShortUrlsListSettings={(v) => updateSettingsProp('shortUrlsList', v)}
              />
            </SettingsSections>
          )}
        />
        <Route
          path="other-items"
          element={(
            <SettingsSections>
              <Tags updateTagsSettings={(v) => updateSettingsProp('tags', v)} />
              <Visits updateVisitsSettings={(v) => updateSettingsProp('visits', v)} />
            </SettingsSections>
          )}
        />
        <Route path="*" element={<Navigate replace to="general" />} />
      </Routes>
    </SettingsProvider>
  );
};
