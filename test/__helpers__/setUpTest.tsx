import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { bottle } from '../../src/container';
import type { RootState } from '../../src/store';
import { setUpStore } from '../../src/store';

export const renderWithEvents = (element: ReactElement, options?: RenderOptions) => ({
  user: userEvent.setup(),
  ...render(element, options),
});

export type RenderOptionsWithState = Omit<RenderOptions, 'wrapper'> & {
  initialState?: Partial<RootState>;
};

export const renderWithStore = (
  element: ReactElement,
  { initialState = {}, ...options }: RenderOptionsWithState = {},
) => {
  const store = setUpStore(bottle.container, initialState);
  const Wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;

  return {
    store,
    ...renderWithEvents(element, { ...options, wrapper: Wrapper }),
  };
};
