import { fromPartial } from '@total-typescript/shoehorn';
import Bottle from 'bottlejs';
import type { TagColorsStorage } from '../src';
import type { ShlinkApiClient } from '../src/api-contract';
import { createShlinkWebComponent } from '../src/ShlinkWebComponent';
import { checkAccessibility } from './__helpers__/accessibility';
import { render } from './__helpers__/setUpTest';

describe('<ShlinkWebComponent />', () => {
  let bottle: Bottle;
  const apiClient = fromPartial<ShlinkApiClient>({});

  const setUp = (tagColorsStorage?: TagColorsStorage) => {
    const ShlinkWebComponent = createShlinkWebComponent(bottle);
    return render(
      <ShlinkWebComponent serverVersion="3.0.0" apiClient={apiClient} tagColorsStorage={tagColorsStorage} />,
    );
  };

  beforeEach(() => {
    bottle = new Bottle();
  });

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('registers services when mounted', async () => {
    expect(bottle.container.TagColorsStorage).not.toBeDefined();
    expect(bottle.container.apiClientFactory).not.toBeDefined();

    await setUp(fromPartial({}));

    await expect.poll(() => bottle.container.TagColorsStorage).toBeDefined();
    expect(bottle.container.apiClientFactory).toBeDefined();
  });

  it('renders main content once store is created', async () => {
    const screen = await setUp();
    await expect.element(screen.getByText('Overview')).toBeInTheDocument();
  });
});
