import type { Store } from '@reduxjs/toolkit';
import type Bottle from 'bottlejs';
import type { FC, ReactNode } from 'react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { BrowserRouter, useInRouterContext } from 'react-router';
import type { ShlinkApiClient } from './api-contract';
import { ContainerProvider } from './container/context';
import { listDomainsThunk as listDomains } from './domains/reducers/domainsList';
import { Main } from './Main';
import { loadMercureInfo } from './mercure/reducers/mercureInfo';
import type { Settings } from './settings';
import { SettingsProvider } from './settings';
import { ShlinkSidebarVisibilityProvider } from './sidebar/ShlinkSidebarVisibilityProvider';
import { setUpStore } from './store';
import { listTagsThunk as listTags } from './tags/reducers/tagsList';
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

// FIXME This allows to track the reference to be resolved by the container, but it's hacky and relies on not more than
//       one ShlinkWebComponent rendered at the same time.
//       Works for now, but should be addressed.
let apiClientRef: ShlinkApiClient;

export const createShlinkWebComponent = (bottle: Bottle): FC<ShlinkWebComponentProps> => (
  { serverVersion, apiClient, settings, routesPrefix = '', createNotFound, tagColorsStorage, autoSidebarToggle = true },
) => {
  const features = useFeatures(serverVersion);
  const [theStore, setStore] = useState<Store | undefined>();

  const inRouterContext = useInRouterContext();
  const RouterOrFragment = useMemo(() => (inRouterContext ? Fragment : BrowserRouter), [inRouterContext]);

  useEffect(() => {
    apiClientRef = apiClient;
    bottle.value('apiClientFactory', () => apiClientRef);

    if (tagColorsStorage) {
      bottle.value('TagColorsStorage', tagColorsStorage);
    }

    // It's important to not try to resolve services before the API client has been registered, as many other services
    // depend on it
    const store = setUpStore();
    setStore(store);

    // Load mercure info
    store.dispatch(loadMercureInfo({ ...settings, apiClientFactory: () => apiClientRef }));
    // Load tags, as they are used by multiple components
    store.dispatch(listTags({ apiClientFactory: () => apiClientRef }));
    // Load domains, as they are used by multiple components
    store.dispatch(listDomains({ apiClientFactory: () => apiClientRef }));
  }, [apiClient, autoSidebarToggle, createNotFound, settings, tagColorsStorage]);

  return !theStore ? <></> : (
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
