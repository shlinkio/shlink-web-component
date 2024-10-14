import { useCallback, useState } from 'react';

export type ServerInfo = {
  baseUrl?: string;
  apiKey?: string;
};

export const isServerInfoSet = (serverInfo: ServerInfo): serverInfo is Required<ServerInfo> =>
  !!serverInfo.apiKey && !!serverInfo.baseUrl;

export const useServerInfo = (): [ServerInfo, (newServerInfo: ServerInfo) => void] => {
  const [serverInfo, setServerInfo] = useState<ServerInfo>(() => {
    const rawInfo = localStorage.getItem('active_shlink_server_info');
    return rawInfo ? JSON.parse(rawInfo) as ServerInfo : {};
  });
  const updateServerInfo = useCallback((newServerInfo: ServerInfo) => {
    localStorage.setItem('active_shlink_server_info', JSON.stringify(serverInfo));
    setServerInfo(newServerInfo);
  }, [serverInfo]);

  return [serverInfo, updateServerInfo];
};
