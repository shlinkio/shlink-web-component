import { useEffect, useMemo, useState } from 'react';

export type ServerInfo = {
  baseUrl?: string;
  apiKey?: string;
};

export const isServerInfoSet = (serverInfo: ServerInfo): serverInfo is Required<ServerInfo> =>
  !!serverInfo.apiKey && !!serverInfo.baseUrl;

export const useServerInfo = (): [ServerInfo, (newServerInfo: ServerInfo) => void] => {
  const rawInfo = useMemo(() => localStorage.getItem('active_shlink_server_info'), []);
  const [serverInfo, setServerInfo] = useState<ServerInfo>(rawInfo ? JSON.parse(rawInfo) : {});

  useEffect(() => {
    localStorage.setItem('active_shlink_server_info', JSON.stringify(serverInfo));
  }, [serverInfo]);

  return [serverInfo, setServerInfo];
};
