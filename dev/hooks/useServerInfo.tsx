import { useMemo, useState } from 'react';

type ServerInfo = {
  baseUrl?: string;
  apiKey?: string;
};

export const useServerInfo = (): [ServerInfo, (newServerInfo: ServerInfo) => void] => {
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    baseUrl: query.get('baseUrl') || undefined,
    apiKey: query.get('apiKey') || undefined,
  });
  const updateServerInfo = (newServerInfo: ServerInfo) => {
    setServerInfo((prevState) => {
      const newState = { ...prevState, ...newServerInfo };
      history.pushState({}, '', `?baseUrl=${newState.baseUrl ?? ''}&apiKey=${newState.apiKey ?? ''}`);
      return newState;
    });
  };

  return [serverInfo, updateServerInfo];
};
