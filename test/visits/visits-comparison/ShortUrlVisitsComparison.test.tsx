import { cleanup, render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ShortUrlIdentifier } from '../../../src/short-urls/data';
import { queryToShortUrl, shortUrlToQuery } from '../../../src/short-urls/helpers';
import { DEFAULT_DOMAIN } from '../../../src/visits/reducers/domainVisits';
import { ShortUrlVisitsComparison } from '../../../src/visits/visits-comparison/ShortUrlVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';

type SetUpOptions = {
  shortUrls?: ShortUrlIdentifier[];
  loadingVisits?: boolean;
  loadingDetails?: boolean;
};

describe('<ShortUrlVisitsComparison />', () => {
  const getShortUrlVisitsForComparison = vi.fn();
  const getShortUrlsDetails = vi.fn();
  const cancelGetShortUrlVisitsComparison = vi.fn();
  const setUp = ({ shortUrls = [], loadingVisits = false, loadingDetails = false }: SetUpOptions = {}) => render(
    <MemoryRouter initialEntries={[{ search: `?short-urls=${shortUrls.map(shortUrlToQuery).join(',')}` }]}>
      <ShortUrlVisitsComparison
        getShortUrlVisitsForComparison={getShortUrlVisitsForComparison}
        cancelGetShortUrlVisitsComparison={cancelGetShortUrlVisitsComparison}
        shortUrlVisitsComparison={fromPartial({
          visitsGroups: Object.fromEntries(shortUrls.map((shortUrl) => [shortUrlToQuery(shortUrl), []])),
          loading: loadingVisits,
          progress: null,
        })}
        getShortUrlsDetails={getShortUrlsDetails}
        shortUrlsDetails={fromPartial({
          shortUrls: new Map(shortUrls.map(
            (shortUrl) => [shortUrl, { ...shortUrl, shortUrl: `https://${shortUrlToQuery(shortUrl)}` }],
          )),
          loading: loadingDetails,
        })}
      />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`)]],
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`), queryToShortUrl(`${DEFAULT_DOMAIN}__bar`)]],
    [[queryToShortUrl('s.test__baz'), queryToShortUrl('s.test__something'), queryToShortUrl('s.test__whatever')]],
  ])('loads short URLs on mount', (shortUrls) => {
    setUp({ shortUrls });

    expect(getShortUrlVisitsForComparison).toHaveBeenCalledWith(expect.objectContaining({ shortUrls }));
    expect(getShortUrlsDetails).toHaveBeenCalledWith(shortUrls);
  });

  it('cancels loading visits when unmounted', () => {
    setUp();

    expect(cancelGetShortUrlVisitsComparison).not.toHaveBeenCalled();
    cleanup();
    expect(cancelGetShortUrlVisitsComparison).toHaveBeenCalledOnce();
  });

  it.each([
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`)]],
    [[queryToShortUrl(`${DEFAULT_DOMAIN}__foo`), queryToShortUrl(`${DEFAULT_DOMAIN}__bar`)]],
    [[queryToShortUrl('s.test__baz'), queryToShortUrl('s.test__something'), queryToShortUrl('s.test__whatever')]],
  ])('renders short URLs in title', (shortUrls) => {
    setUp({ shortUrls });
    expect(screen.getByTestId('title')).toHaveTextContent(`Comparing ${shortUrls.length} short URLs`);
  });

  it('renders loading in title if details are still loading', () => {
    setUp({ loadingDetails: true });
    expect(screen.getByTestId('title')).toHaveTextContent('Loading...');
  });

  it.each([
    [false, true],
    [true, false],
    [true, true],
  ])('renders global loading if either details or visits are loading', (loadingDetails, loadingVisits) => {
    setUp({ loadingDetails, loadingVisits });
    expect(screen.getAllByRole('heading', { name: 'Loading...' }).length > 0).toEqual(true);
  });
});
