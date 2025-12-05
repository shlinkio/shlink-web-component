import type { ProblemDetailsError } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { SettingsProvider } from '../../src/settings';
import { EditShortUrl } from '../../src/short-urls/EditShortUrl';
import type { ShortUrlEdition } from '../../src/short-urls/reducers/shortUrlEdition';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<EditShortUrl />', () => {
  const getShortUrlsDetails = vi.fn();
  const setUp = async (edition: Partial<ShortUrlEdition> = {}) => {
    const renderResult = renderWithStore(
      <MemoryRouterWithParams params={{ shortCode: 'abc123' }}>
        <SettingsProvider value={{}}>
          <EditShortUrl />
        </SettingsProvider>
      </MemoryRouterWithParams>,
      {
        initialState: { shortUrlEdition: fromPartial(edition) },
        apiClientFactory: () => fromPartial({ getShortUrl: getShortUrlsDetails }),
      },
    );

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  beforeEach(() => {
    getShortUrlsDetails.mockImplementation((identifier) => Promise.resolve(
      { shortUrl: 'https://s.test/abc123', meta: {}, ...identifier },
    ));
  });

  it.each([
    {},
    { error: true, saved: true },
    { error: false, saved: true },
  ])('passes a11y checks', (edition) => checkAccessibility(setUp(edition)));

  it('renders loading message while loading detail', async () => {
    const setUpPromise = setUp();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('URL to be shortened')).not.toBeInTheDocument();

    await setUpPromise;
  });

  it('renders error when loading detail fails', async () => {
    getShortUrlsDetails.mockRejectedValue(fromPartial<ProblemDetailsError>({}));

    await setUp();

    expect(screen.getByText('An error occurred while loading short URL detail :(')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('URL to be shortened')).not.toBeInTheDocument();
  });

  it('renders form when detail properly loads', async () => {
    await setUp();

    expect(screen.getByPlaceholderText('URL to be shortened')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('An error occurred while loading short URL detail :(')).not.toBeInTheDocument();
  });

  it('shows error when saving data has failed', async () => {
    await setUp({ error: true, saved: true });

    expect(screen.getByText('An error occurred while updating short URL :(')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL to be shortened')).toBeInTheDocument();
  });

  it('shows message when saving data succeeds', async () => {
    await setUp({ error: false, saved: true });

    expect(screen.getByText('Short URL properly edited.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL to be shortened')).toBeInTheDocument();
  });
});
