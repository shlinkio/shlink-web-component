import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import Bottle from 'bottlejs';
import type { TagColorsStorage } from '../src';
import type { ShlinkApiClient } from '../src/api-contract';
import { createShlinkWebComponent } from '../src/ShlinkWebComponent';
import { checkAccessibility } from './__helpers__/accessibility';

describe('<ShlinkWebComponent />', () => {
  let bottle: Bottle;
  const dispatch = vi.fn();
  const loadMercureInfo = vi.fn();
  const listTags = vi.fn();
  const apiClient = fromPartial<ShlinkApiClient>({});

  const setUp = (tagColorsStorage?: TagColorsStorage) => {
    const ShlinkWebComponent = createShlinkWebComponent(bottle);
    return render(
      <ShlinkWebComponent serverVersion="3.0.0" apiClient={apiClient} tagColorsStorage={tagColorsStorage} />,
    );
  };

  beforeEach(() => {
    bottle = new Bottle();

    bottle.value('Main', () => <>Main</>);
    bottle.value('store', {
      dispatch,
      getState: vi.fn().mockReturnValue({}),
      subscribe: vi.fn(),
    });
    bottle.value('loadMercureInfo', loadMercureInfo);
    bottle.value('listTags', listTags);
  });

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('registers services when mounted', async () => {
    expect(bottle.container.TagColorsStorage).not.toBeDefined();
    expect(bottle.container.apiClientFactory).not.toBeDefined();

    setUp(fromPartial({}));

    await waitFor(() => expect(bottle.container.TagColorsStorage).toBeDefined());
    expect(bottle.container.apiClientFactory).toBeDefined();
  });

  it('renders main content', async () => {
    setUp();
    await waitFor(() => expect(screen.getByText('Main')).toBeInTheDocument());
  });

  it('dispatches some redux actions on mount', async () => {
    setUp();

    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(2));
    expect(loadMercureInfo).toHaveBeenCalledOnce();
    expect(listTags).toHaveBeenCalledOnce();
  });
});
