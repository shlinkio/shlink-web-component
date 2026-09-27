import type { ProblemDetailsError } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { SettingsProvider } from '../../src/settings';
import { EditShortUrl } from '../../src/short-urls/EditShortUrl';
import type { ShortUrlEdition } from '../../src/short-urls/reducers/shortUrlEdition';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithStore } from '../__helpers__/setUpTest';

type SetUpOptions = Partial<ShortUrlEdition> & {
  loading?: boolean;
};

describe('<EditShortUrl />', () => {
  const getShortUrlsDetails = vi.fn();
  const setUp = ({ loading, ...edition }: SetUpOptions = {}) =>
    renderWithStore(
      <MemoryRouterWithParams params={{ shortCode: 'abc123' }}>
        <SettingsProvider value={{}}>
          <EditShortUrl />
        </SettingsProvider>
      </MemoryRouterWithParams>,
      {
        initialState: {
          shortUrlEdition: fromPartial(edition),
          shortUrlsDetails: fromPartial({ status: loading ? 'loading' : 'idle' }),
        },
        apiClientFactory: () => fromPartial({ getShortUrl: getShortUrlsDetails }),
      },
    );

  beforeEach(() => {
    getShortUrlsDetails.mockImplementation((identifier) =>
      Promise.resolve({ shortUrl: 'https://s.test/abc123', meta: {}, ...identifier }),
    );
  });

  it.each([{}, { error: true, saved: true }, { error: false, saved: true }])('passes a11y checks', (edition) =>
    checkAccessibility(setUp(edition)),
  );

  // FIXME
  it.skip('renders loading message while loading detail', async () => {
    const screen = await setUp({ loading: true });
    await expect.element(screen.getByPlaceholder('URL to be shortened')).not.toBeInTheDocument();
  });

  it('renders error when loading detail fails', async () => {
    getShortUrlsDetails.mockRejectedValue(fromPartial<ProblemDetailsError>({}));

    const screen = await setUp();

    await expect.element(screen.getByText('An error occurred while loading short URL detail :(')).toBeInTheDocument();
    await expect.element(screen.getByPlaceholder('URL to be shortened')).not.toBeInTheDocument();
  });

  it('renders form when detail properly loads', async () => {
    const screen = await setUp();

    await expect.element(screen.getByPlaceholder('URL to be shortened')).toBeInTheDocument();
    await expect
      .element(screen.getByText('An error occurred while loading short URL detail :('))
      .not.toBeInTheDocument();
  });

  it('shows error when saving data has failed', async () => {
    const screen = await setUp({ error: true, saved: true });

    await expect.element(screen.getByText('An error occurred while updating short URL :(')).toBeInTheDocument();
    await expect.element(screen.getByPlaceholder('URL to be shortened')).toBeInTheDocument();
  });

  it('shows message when saving data succeeds', async () => {
    const screen = await setUp({ error: false, saved: true });

    await expect.element(screen.getByText('Short URL properly edited.')).toBeInTheDocument();
    await expect.element(screen.getByPlaceholder('URL to be shortened')).toBeInTheDocument();
  });
});
