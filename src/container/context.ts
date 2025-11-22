import type { IContainer } from 'bottlejs';
import { createContext, useContext } from 'react';

const ContainerContext = createContext<IContainer | null>(null);

export const ContainerProvider = ContainerContext.Provider;

export const useDependencies = <T extends unknown[]>(...names: string[]): T => {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('You cannot use "useDependencies" outside of a ContainerProvider');
  }

  return names.map((name) => {
    const dependency = container[name];
    if (!dependency) {
      throw new Error(`Dependency with name "${name}" not found in container`);
    }

    return dependency;
  }) as T;
};
