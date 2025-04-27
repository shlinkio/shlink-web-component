import { mergeDeepRight } from '@shlinkio/data-manipulation';
import { NavPills } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { DeepPartial } from '../../utils/types';
import type { QrCodeSettings } from '..';
import { SettingsProvider } from '..';
import type { RealTimeUpdatesSettings, Settings, ShortUrlsListSettings } from '../types';
import { QrCodeColorSettings } from './qr-codes/QrCodeColorSettings';
import { QrCodeFormatSettings } from './qr-codes/QrCodeFormatSettings';
import { QrCodeSizeSettings } from './qr-codes/QrCodeSizeSettings';
import { RealTimeUpdatesSettings as RealTimeUpdates } from './RealTimeUpdatesSettings';
import { ShortUrlCreationSettings as ShortUrlCreation } from './ShortUrlCreationSettings';
import { ShortUrlsListSettings as ShortUrlsList } from './ShortUrlsListSettings';
import { TagsSettings as Tags } from './TagsSettings';
import { UserInterfaceSettings } from './UserInterfaceSettings';
import { VisitsSettings as Visits } from './VisitsSettings';

export type ShlinkWebSettingsProps = {
  settings: Settings;
  defaultShortUrlsListOrdering: NonNullable<ShortUrlsListSettings['defaultOrdering']>;
  /** Callback invoked every time the settings are updated */
  onUpdateSettings?: (settings: Settings) => void;

  /** @deprecated Use onUpdateSettings instead */
  updateSettings?: (settings: Settings) => void;
};

const SettingsSections: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={clsx('tw:flex tw:flex-col tw:gap-4', className)}>
    {children}
  </div>
);

export const ShlinkWebSettings: FC<ShlinkWebSettingsProps> = ({
  settings,
  updateSettings,
  onUpdateSettings = updateSettings,
  defaultShortUrlsListOrdering,
}) => {
  const updatePartialSettings = useCallback(
    (partialSettings: DeepPartial<Settings>) => onUpdateSettings?.(mergeDeepRight(settings, partialSettings)),
    [settings, onUpdateSettings],
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
  const updateQrCodeSettings = useCallback(
    (s: QrCodeSettings) => updateSettingsProp('qrCodes', s),
    [updateSettingsProp],
  );

  return (
    <SettingsProvider value={settings}>
      <NavPills className="tw:mb-4">
        <NavPills.Pill to="../general">General</NavPills.Pill>
        <NavPills.Pill to="../short-urls">Short URLs</NavPills.Pill>
        <NavPills.Pill to="../qr-codes">QR codes</NavPills.Pill>
        <NavPills.Pill to="../other-items">Other items</NavPills.Pill>
      </NavPills>

      <Routes>
        <Route
          path="general"
          element={(
            <SettingsSections>
              <UserInterfaceSettings onChange={(v) => updateSettingsProp('ui', v)} />
              <RealTimeUpdates
                toggleRealTimeUpdates={toggleRealTimeUpdates}
                onIntervalChange={setRealTimeUpdatesInterval}
              />
            </SettingsSections>
          )}
        />
        <Route
          path="short-urls"
          element={(
            <SettingsSections>
              <ShortUrlCreation onChange={(v) => updateSettingsProp('shortUrlCreation', v)} />
              <ShortUrlsList
                defaultOrdering={defaultShortUrlsListOrdering}
                onChange={(v) => updateSettingsProp('shortUrlsList', v)}
              />
            </SettingsSections>
          )}
        />
        <Route
          path="other-items"
          element={(
            <SettingsSections>
              <Tags onChange={(v) => updateSettingsProp('tags', v)} />
              <Visits onChange={(v) => updateSettingsProp('visits', v)} />
            </SettingsSections>
          )}
        />
        <Route
          path="qr-codes"
          element={(
            <SettingsSections>
              <div className="tw:flex tw:flex-col tw:lg:flex-row tw:gap-4">
                <QrCodeSizeSettings onChange={updateQrCodeSettings} className="tw:w-full" />
                <QrCodeColorSettings onChange={updateQrCodeSettings} className="tw:w-full" />
              </div>
              <QrCodeFormatSettings onChange={updateQrCodeSettings} />
            </SettingsSections>
          )}
        />
        <Route path="*" element={<Navigate replace to="../general" />} />
      </Routes>
    </SettingsProvider>
  );
};
