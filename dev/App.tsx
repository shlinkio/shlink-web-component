import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/fetch';
import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback , useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { ShlinkWebComponent } from '../src';
import type { Settings } from '../src/settings';
import { ShlinkWebSettings } from '../src/settings';
import type { SemVer } from '../src/utils/helpers/version';
import { ServerInfoForm } from './server-info/ServerInfoForm';
import type { ServerInfo } from './server-info/useServerInfo';
import { isServerInfoSet,useServerInfo  } from './server-info/useServerInfo';
import { ThemeToggle } from './ThemeToggle';

export const App: FC = () => {
  const [serverInfo, updateServerInfo] = useServerInfo();
  const [serverVersion, setServerVersion] = useState<SemVer>();
  const onServerInfoChange = useCallback((newServerInfo: ServerInfo) => {
    updateServerInfo(newServerInfo);
    setServerVersion(undefined);
  }, [updateServerInfo]);

  const apiClient = useMemo(
    () => isServerInfoSet(serverInfo) ? new ShlinkApiClient(new FetchHttpClient(), serverInfo) : null,
    [serverInfo],
  );
  const [settings, setSettings] = useState<Settings>({});
  const location = useLocation();
  const routesPrefix = useMemo(
    () => (location.pathname.startsWith('/sub/route') ? '/sub/route' : undefined),
    [location],
  );

  useEffect(() => {
    if (!serverVersion) {
      apiClient?.health().then((result) => setServerVersion(result.version as SemVer));
    }
  }, [apiClient, serverVersion]);

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-1000',
          'h-(--header-height) flex justify-between',
          'bg-lm-main dark:bg-dm-main text-white',
        )}
      >
        <ServerInfoForm serverInfo={serverInfo} onChange={onServerInfoChange} />
        <div className="h-full pr-4 flex items-center gap-4">
          <Link to="/" className="text-white">Home</Link>
          <Link to="/settings" className="text-white">Settings</Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="py-(--header-height)">
        <Routes>
          <Route path="/settings">
            <Route
              path="*"
              element={(
                <div className="container mx-auto pt-6">
                  <ShlinkWebSettings
                    settings={settings}
                    onUpdateSettings={setSettings}
                    defaultShortUrlsListOrdering={{}}
                  />
                </div>
              )}
            />
            <Route path="" element={<Navigate replace to="general" />} />
          </Route>
          <Route
            path={routesPrefix ? `${routesPrefix}*` : '*'}
            element={apiClient && serverVersion ? (
              <ShlinkWebComponent
                serverVersion={serverVersion}
                apiClient={apiClient}
                settings={settings}
                routesPrefix={routesPrefix}
              />
            ) : <div className="container mx-auto pt-6">Not connected</div>}
          />
          <Route path="*" element={<h3 className="mt-4 text-center">Not found</h3>} />
        </Routes>
      </div>
    </>
  );
};
