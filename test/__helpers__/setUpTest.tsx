import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { fromPartial } from '@total-typescript/shoehorn';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import type { RenderOptions } from 'vitest-browser-react';
import { render as vitestRender, cleanup as vitestCleanup } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ContainerProvider } from '../../src/container/context';
import type { RootState } from '../../src/store';
import { setUpStore } from '../../src/store';

export const cleanup = vitestCleanup;

export const render = vitestRender;

export const renderWithEvents = async (element: ReactElement, options?: RenderOptions) => ({
  user: userEvent.setup(),
  ...(await render(element, options)),
});

export type RenderWithEventsResult = Awaited<ReturnType<typeof renderWithEvents>>;

export type RenderOptionsWithState = Omit<RenderOptions, 'wrapper'> & {
  initialState?: Partial<RootState>;
  apiClientFactory?: () => ShlinkApiClient;
};

export const renderWithStore = async (
  element: ReactElement,
  { initialState = {}, apiClientFactory = vi.fn(), ...options }: RenderOptionsWithState = {},
) => {
  const store = setUpStore(initialState);
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ContainerProvider value={fromPartial({ apiClientFactory })}>
      <Provider store={store}>{children}</Provider>
    </ContainerProvider>
  );

  return {
    store,
    ...(await renderWithEvents(element, { ...options, wrapper: Wrapper })),
  };
};
