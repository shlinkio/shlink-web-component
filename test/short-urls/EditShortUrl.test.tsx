import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../src/api-contract';
import { SettingsProvider } from '../../src/settings';
import { EditShortUrlFactory } from '../../src/short-urls/EditShortUrl';
import type { ShortUrlEdition } from '../../src/short-urls/reducers/shortUrlEdition';
import type { ShortUrlsDetails } from '../../src/short-urls/reducers/shortUrlsDetails';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';

describe('<EditShortUrl />', () => {
  const shortUrlCreation = { validateUrls: true };
  const identifier = { shortCode: 'abc123' };
  const shortUrlToMap = (shortUrl: ShlinkShortUrl) => fromPartial<Map<ShlinkShortUrlIdentifier, ShlinkShortUrl>>({
    get: () => shortUrl,
  });
  const getShortUrlsDetails = vi.fn();
  const EditShortUrl = EditShortUrlFactory(fromPartial({ ShortUrlForm: () => <span>ShortUrlForm</span> }));
  const setUp = (detail: Partial<ShortUrlsDetails> = {}, edition: Partial<ShortUrlEdition> = {}) => render(
    <MemoryRouterWithParams params={identifier}>
      <SettingsProvider value={fromPartial({ shortUrlCreation })}>
        <EditShortUrl
          shortUrlsDetails={fromPartial(detail)}
          shortUrlEdition={fromPartial(edition)}
          getShortUrlsDetails={getShortUrlsDetails}
          editShortUrl={vi.fn(async () => Promise.resolve())}
        />
      </SettingsProvider>
    </MemoryRouterWithParams>,
  );

  it.each([
    [{ loading: true }, {}],
    [{ error: true }, {}],
    [{}, {}],
    [{}, { error: true, saved: true }],
    [{}, { error: false, saved: true }],
  ])('passes a11y checks', (detail, edition) => checkAccessibility(setUp(
    {
      shortUrls: shortUrlToMap(fromPartial({
        shortUrl: 'https://s.test/abc123',
        meta: {},
      })),
      ...detail,
    },
    edition,
  )));

  it('renders loading message while loading detail', () => {
    setUp({ loading: true });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('ShortUrlForm')).not.toBeInTheDocument();
  });

  it('renders error when loading detail fails', () => {
    setUp({ error: true });

    expect(screen.getByText('An error occurred while loading short URL detail :(')).toBeInTheDocument();
    expect(screen.queryByText('ShortUrlForm')).not.toBeInTheDocument();
  });

  it('renders form when detail properly loads', () => {
    setUp({ shortUrls: shortUrlToMap(fromPartial({ meta: {} })) });

    expect(screen.getByText('ShortUrlForm')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('An error occurred while loading short URL detail :(')).not.toBeInTheDocument();
  });

  it('shows error when saving data has failed', () => {
    setUp({}, { error: true, saved: true });

    expect(screen.getByText('An error occurred while updating short URL :(')).toBeInTheDocument();
    expect(screen.getByText('ShortUrlForm')).toBeInTheDocument();
  });

  it('shows message when saving data succeeds', () => {
    setUp({}, { error: false, saved: true });

    expect(screen.getByText('Short URL properly edited.')).toBeInTheDocument();
    expect(screen.getByText('ShortUrlForm')).toBeInTheDocument();
  });
});
