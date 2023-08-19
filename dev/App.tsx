import type { FC, FormEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { Button, Input } from 'reactstrap';
import { ShlinkWebComponent } from '../src';
import { ShlinkApiClient } from './api/ShlinkApiClient';
import { useServerInfo } from './hooks/useServerInfo';
import { ThemeToggle } from './ThemeToggle';

export const App: FC = () => {
  const [serverInfo, updateServerInfo] = useServerInfo();
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    // @ts-expect-error - Entries is not recognized for some reason
    updateServerInfo(Object.fromEntries(new FormData(e.target).entries()));
  }, []);
  const apiClient = useMemo(
    () => serverInfo.apiKey && serverInfo.baseUrl && new ShlinkApiClient(serverInfo.baseUrl, serverInfo.apiKey),
    [serverInfo],
  );

  return (
    <>
      <header className="header fixed-top text-white d-flex justify-content-between">
        <form className="py-2 ps-2 d-flex gap-2" onSubmit={handleSubmit}>
          <Input name="baseUrl" placeholder="Server URL" type="url" defaultValue={serverInfo.baseUrl} />
          <Input name="apiKey" placeholder="API key" defaultValue={serverInfo.apiKey} />
          <Button type="submit" color="light">Load</Button>
        </form>
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
