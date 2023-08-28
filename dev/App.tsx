import { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { FetchHttpClient } from '@shlinkio/shlink-js-sdk/browser';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
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

  return (
    <>
      <header className="header fixed-top text-white d-flex justify-content-between">
        <ServerInfoForm onChange={setServerInfo} />
        <div className="h-100 text-end pe-3 pt-3">
          <ThemeToggle />
        </div>
      </header>
      <div className="wrapper">
        {apiClient && <ShlinkWebComponent serverVersion="latest" apiClient={apiClient} />}
      </div>
    </>
  );
};
