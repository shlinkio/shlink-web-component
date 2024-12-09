import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import type { LinkSuffix, ShortUrlDetailLinkProps } from '../../../src/short-urls/helpers/ShortUrlDetailLink';
import { ShortUrlDetailLink } from '../../../src/short-urls/helpers/ShortUrlDetailLink';
import { RoutesPrefixProvider } from '../../../src/utils/routesPrefix';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShortUrlDetailLink />', () => {
  const setUp = (props: Partial<ShortUrlDetailLinkProps>, routesPrefix = '') => render(
    <MemoryRouter>
      <RoutesPrefixProvider value={routesPrefix}>
        <ShortUrlDetailLink asLink suffix="visits" {...props}>
          Something
        </ShortUrlDetailLink>
      </RoutesPrefixProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({
    shortUrl: fromPartial<ShlinkShortUrl>({ shortCode: 'abc123' }),
  })));

  it.each([
    [false, undefined],
    [false, null],
    [true, null],
    [true, undefined],
    [false, fromPartial<ShlinkShortUrl>({})],
    [false, fromPartial<ShlinkShortUrl>({})],
  ])('only renders a plain span when short URL is not set or asLink is false', (asLink, shortUrl) => {
    setUp({ asLink, shortUrl });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Something')).toBeInTheDocument();
  });

  it.each([
    [
      '/server/1',
      fromPartial<ShlinkShortUrl>({ shortCode: 'abc123' }),
      'visits' as LinkSuffix,
      '/server/1/short-code/abc123/visits',
    ],
    [
      '/foobar',
      fromPartial<ShlinkShortUrl>({ shortCode: 'def456', domain: 'example.com' }),
      'visits' as LinkSuffix,
      '/foobar/short-code/def456/visits?domain=example.com',
    ],
    [
      '/server/1',
      fromPartial<ShlinkShortUrl>({ shortCode: 'abc123' }),
      'edit' as LinkSuffix,
      '/server/1/short-code/abc123/edit',
    ],
    [
      '/server/3',
      fromPartial<ShlinkShortUrl>({ shortCode: 'def456', domain: 'example.com' }),
      'edit' as LinkSuffix,
      '/server/3/short-code/def456/edit?domain=example.com',
    ],
  ])('renders link with expected query', (routesPrefix, shortUrl, suffix, expectedLink) => {
    setUp({ shortUrl, suffix }, routesPrefix);
    expect(screen.getByRole('link')).toHaveProperty('href', expect.stringContaining(expectedLink));
  });
});
