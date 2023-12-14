import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/browser';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { Settings } from '../src';
import { ShlinkWebComponent } from '../src';
import { ServerInfoForm } from './server-info/ServerInfoForm';
import type { ServerInfo } from './server-info/useServerInfo';
import { isServerInfoSet } from './server-info/useServerInfo';
import { ThemeToggle } from './ThemeToggle';

export const App: FC = () => {
  const [serverInfo, setServerInfo] = useState<ServerInfo>({});
  const apiClient = useMemo(
    () => isServerInfoSet(serverInfo) && new ShlinkApiClient(new FetchHttpClient(), serverInfo),
    [serverInfo],
  );
  const settings = useMemo((): Settings => ({
    realTimeUpdates: { enabled: true },
  }), []);
  const routesPrefix = useMemo(
    () => (window.location.pathname.startsWith('/sub/route') ? '/sub/route' : undefined),
    [],
  );

  return (
    <>
      <header className="header fixed-top text-white d-flex justify-content-between">
        <ServerInfoForm onChange={setServerInfo} />
        <div className="h-100 text-end pe-3 pt-3">
          <ThemeToggle />
        </div>
      </header>
      <div className="wrapper">
        {apiClient && (
          <BrowserRouter>
            <Routes>
              <Route
                path={routesPrefix ? `${routesPrefix}*` : '*'}
                element={(
                  <ShlinkWebComponent
                    serverVersion="latest"
                    apiClient={apiClient}
                    settings={settings}
                    routesPrefix={routesPrefix}
                  />
                )}
              />
              <Route path="*" element={<h3 className="mt-3 text-center">Not found</h3>} />
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </>
  );
};
