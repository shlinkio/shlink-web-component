import type { Store } from '@reduxjs/toolkit';
import type Bottle from 'bottlejs';
import type { FC, ReactNode } from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { BrowserRouter, useInRouterContext } from 'react-router';
import type { ShlinkApiClient } from './api-contract';
import { ContainerProvider } from './container/context';
import { Main } from './Main';
import type { Settings } from './settings';
import { SettingsProvider } from './settings';
import { ShlinkSidebarVisibilityProvider } from './sidebar/ShlinkSidebarVisibilityProvider';
import { setUpStore } from './store';
import { FeaturesProvider, useFeatures } from './utils/features';
import type { SemVerOrLatest } from './utils/helpers/version';
import { RoutesPrefixProvider } from './utils/routesPrefix';
import type { TagColorsStorage } from './utils/services/TagColorsStorage';

export type ShlinkWebComponentProps = {
  serverVersion: SemVerOrLatest; // TODO Consider making this optional and trying to resolve it if not set
  apiClient: ShlinkApiClient;
  tagColorsStorage?: TagColorsStorage;
  routesPrefix?: string;
  settings?: Exclude<Settings, 'ui'>;
  createNotFound?: (nonPrefixedHomePath: string) => ReactNode;

  /**
   * Whether to automatically append a responsive sidebar toggle button or not.
   * You can set this to `false` and position your own toggle where it better suits you.
   * Defaults to `true`.
   */
  autoSidebarToggle?: boolean;
};

export const createShlinkWebComponent = (bottle: Bottle): FC<ShlinkWebComponentProps> => (
  { serverVersion, apiClient, settings, routesPrefix = '', createNotFound, tagColorsStorage, autoSidebarToggle = true },
) => {
  const features = useFeatures(serverVersion);
  const [theStore, setStore] = useState<Store | undefined>();

  const inRouterContext = useInRouterContext();
  const RouterOrFragment = useMemo(() => (inRouterContext ? Fragment : BrowserRouter), [inRouterContext]);

  useEffect(() => {
    const apiClientFactory = () => apiClient;
    bottle.value('apiClientFactory', apiClientFactory);

    if (tagColorsStorage) {
      bottle.value('TagColorsStorage', tagColorsStorage);
    }

    // Create store after the API client has been registered in the container
    const store = setUpStore();
    setStore(store);
  }, [apiClient, autoSidebarToggle, createNotFound, settings, tagColorsStorage]);

  return theStore && (
    <ReduxStoreProvider store={theStore}>
      <ContainerProvider value={bottle.container}>
        <SettingsProvider value={settings ?? {}}>
          <FeaturesProvider value={features}>
            <ShlinkSidebarVisibilityProvider>
              <RoutesPrefixProvider value={routesPrefix}>
                <RouterOrFragment>
                  <Main createNotFound={createNotFound} autoToggleButton={autoSidebarToggle} />
                </RouterOrFragment>
              </RoutesPrefixProvider>
            </ShlinkSidebarVisibilityProvider>
          </FeaturesProvider>
        </SettingsProvider>
      </ContainerProvider>
    </ReduxStoreProvider>
  );
};
