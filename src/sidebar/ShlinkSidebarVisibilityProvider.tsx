import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';
import { createContext,useContext  } from 'react';

export type SidebarVisibility = {
  sidebarVisible: boolean;
  toggleSidebar: () => void;
  showSidebar: () => void;
  hideSidebar: () => void;
};

const SidebarVisibilityContext = createContext<SidebarVisibility | undefined>(undefined);

export const useSidebarVisibility = () => useContext(SidebarVisibilityContext);

export const ShlinkSidebarVisibilityProvider: FC<PropsWithChildren> = ({ children }) => {
  const prevContext = useSidebarVisibility();
  const { flag: sidebarVisible, toggle: toggleSidebar, setToTrue: showSidebar, setToFalse: hideSidebar } = useToggle();

  // Ensure all nested ShlinkSidebarVisibilityProviders use the same context, but if this is the first provider, create
  // a new one
  const providerValue = prevContext ?? { sidebarVisible, toggleSidebar, showSidebar, hideSidebar };

  return (
    <SidebarVisibilityContext.Provider value={providerValue}>
      {children}
    </SidebarVisibilityContext.Provider>
  );
};
