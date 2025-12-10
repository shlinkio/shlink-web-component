import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkShortUrlIdentifier } from '../../../src/api-contract';
import { DEFAULT_DOMAIN } from '../../../src/domains/data';
import { queryToShortUrl, shortUrlToQuery } from '../../../src/short-urls/helpers';
import { ShortUrlVisitsComparison } from '../../../src/visits/visits-comparison/ShortUrlVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  shortUrls?: ShlinkShortUrlIdentifier[];
};

describe('<ShortUrlVisitsComparison />', () => {
  const getShortUrl = vi.fn().mockImplementation(
    async (id: ShlinkShortUrlIdentifier) => ({ ...id, shortUrl: `https://${shortUrlToQuery(id)}` }),
  );
  const getShortUrlVisits = vi.fn().mockResolvedValue(fromPartial<ShlinkVisitsList>({
    data: [],
    pagination: { pagesCount: 1, currentPage: 1, totalItems: 0 },
  }));
  const setUp = async ({ shortUrls = [] }: SetUpOptions = {}) => {
    const renderResult = renderWithStore(
      <MemoryRouter initialEntries={[{ search: `?short-urls=${shortUrls.map(shortUrlToQuery).join(',')}` }]}>
        <ShortUrlVisitsComparison />
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({ getShortUrl, getShortUrlVisits }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`)]],
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`), queryToShortUrl(`${DEFAULT_DOMAIN}__bar`)]],
    [[queryToShortUrl('s.test__baz'), queryToShortUrl('s.test__something'), queryToShortUrl('s.test__whatever')]],
  ])('loads short URLs on mount', async (shortUrls) => {
    await setUp({ shortUrls });

    expect(getShortUrlVisits).toHaveBeenCalledTimes(shortUrls.length);
    expect(getShortUrl).toHaveBeenCalledTimes(shortUrls.length);
  });

  it('cancels loading visits when unmounted', async () => {
    const { store } = await setUp();
    const isCanceled = () => store.getState().shortUrlVisitsComparison.status === 'canceled';

    expect(isCanceled()).toBe(false);
    cleanup();
    expect(isCanceled()).toBe(true);
  });

  it.each([
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`)]],
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`), queryToShortUrl(`${DEFAULT_DOMAIN}__bar`)]],
    [[queryToShortUrl('s.test__baz'), queryToShortUrl('s.test__something'), queryToShortUrl('s.test__whatever')]],
  ])('renders short URLs in title', async (shortUrls) => {
    await setUp({ shortUrls });
    expect(screen.getByTestId('title')).toHaveTextContent(`Comparing ${shortUrls.length} short URLs`);
  });

  it('renders global loading if visits and details are loading', async () => {
    const setUpPromise = setUp();
    expect(screen.getByRole('heading', { name: 'Loading...' })).toBeInTheDocument();
    await setUpPromise;
  });
});
