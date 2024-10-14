import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/browser';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ShlinkWebComponent } from '../src';
import type { Settings } from '../src/settings';
import { ShlinkWebSettings } from '../src/settings';
import type { SemVer } from '../src/utils/helpers/version';
import { ServerInfoForm } from './server-info/ServerInfoForm';
import type { ServerInfo } from './server-info/useServerInfo';
import { useServerInfo } from './server-info/useServerInfo';
import { isServerInfoSet } from './server-info/useServerInfo';
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
  const routesPrefix = useMemo(
    () => (window.location.pathname.startsWith('/sub/route') ? '/sub/route' : undefined),
    [],
  );

  useEffect(() => {
    if (!serverVersion) {
      apiClient?.health().then((result) => setServerVersion(result.version as SemVer));
    }
  }, [apiClient, serverVersion]);

  return (
    <BrowserRouter>
      <header className="header fixed-top text-white d-flex justify-content-between">
        <ServerInfoForm serverInfo={serverInfo} onChange={onServerInfoChange} />
        <div className="h-100 text-end pe-3 pt-3 d-flex gap-3">
          <Link to="/" className="text-white">Home</Link>
          <Link to="/settings" className="text-white">Settings</Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="wrapper">
        <Routes>
          <Route
            path="/settings/*"
            element={(
              <div className="container pt-4">
                <ShlinkWebSettings
                  settings={settings}
                  updateSettings={setSettings}
                  defaultShortUrlsListOrdering={{}}
                />
              </div>
            )}
          />
          <Route
            path={routesPrefix ? `${routesPrefix}*` : '*'}
            element={apiClient && serverVersion ? (
              <ShlinkWebComponent
                serverVersion={serverVersion}
                apiClient={apiClient}
                settings={settings}
                routesPrefix={routesPrefix}
              />
            ) : <div className="container pt-4">Not connected</div>}
          />
          <Route path="*" element={<h3 className="mt-3 text-center">Not found</h3>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
