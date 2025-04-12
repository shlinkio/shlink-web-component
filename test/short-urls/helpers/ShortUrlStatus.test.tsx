import { render } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkShortUrl, ShlinkShortUrlMeta, ShlinkVisitsSummary } from '../../../src/api-contract';
import { ShortUrlStatus } from '../../../src/short-urls/helpers/ShortUrlStatus';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShortUrlStatus />', () => {
  const setUp = (shortUrl: ShlinkShortUrl) => render(<ShortUrlStatus shortUrl={shortUrl} />);

  it('passes a11y checks', () => checkAccessibility(setUp(fromPartial({
    meta: fromPartial({ maxVisits: 10 }),
  }))));

  it.each([
    [
      fromPartial<ShlinkShortUrlMeta>({ validSince: '2099-01-01T10:30:15' }),
      {},
      'This short URL will start working on 2099-01-01 10:30',
    ],
    [
      fromPartial<ShlinkShortUrlMeta>({ validUntil: '2020-01-01T10:30:15' }),
      {},
      'This short URL cannot be visited since 2020-01-01 10:30',
    ],
    [
      fromPartial<ShlinkShortUrlMeta>({ maxVisits: 10 }),
      fromPartial<ShlinkVisitsSummary>({ total: 10 }),
      'This short URL cannot be currently visited because it has reached the maximum amount of 10 visits',
    ],
    [
      fromPartial<ShlinkShortUrlMeta>({ maxVisits: 1 }),
      fromPartial<ShlinkVisitsSummary>({ total: 1 }),
      'This short URL cannot be currently visited because it has reached the maximum amount of 1 visit',
    ],
    [{}, {}, 'This short URL can be visited normally'],
    [fromPartial<ShlinkShortUrlMeta>({ validUntil: '2099-01-01T10:30:15' }), {}, 'This short URL can be visited normally'],
    [fromPartial<ShlinkShortUrlMeta>({ validSince: '2020-01-01T10:30:15' }), {}, 'This short URL can be visited normally'],
    [
      fromPartial<ShlinkShortUrlMeta>({ maxVisits: 10 }),
      fromPartial<ShlinkVisitsSummary>({ total: 1 }),
      'This short URL can be visited normally',
    ],
  ])('shows expected tooltip', (meta, visitsSummary, expectedTooltip) => {
    const { container } = setUp(fromPartial({ meta, visitsSummary }));
    expect(container.firstChild).toHaveAttribute('title', expectedTooltip);
  });
});
