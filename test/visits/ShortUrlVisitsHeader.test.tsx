import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatDistance, parseISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import type { ShortUrlVisits } from '../../src/visits/reducers/shortUrlVisits';
import { ShortUrlVisitsHeader } from '../../src/visits/ShortUrlVisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<ShortUrlVisitsHeader />', () => {
  const dateCreated = '2018-01-01T10:00:00+00:00';
  const longUrl = 'https://foo.bar/bar/foo';
  const shortUrlVisits = fromPartial<ShortUrlVisits>({
    visits: [{}, {}, {}],
  });
  const setUp = (title?: string | null) =>
    renderWithEvents(
      <MemoryRouter>
        <ShortUrlVisitsHeader
          loading={false}
          shortUrlVisits={shortUrlVisits}
          shortUrl={fromPartial<ShlinkShortUrl>({
            shortUrl: 'https://s.test/abc123',
            longUrl,
            dateCreated,
            title,
          })}
        />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows when the URL was created', async () => {
    const { user, ...screen } = await setUp();
    const dateElement = screen.getByText(`${formatDistance(new Date(), parseISO(dateCreated))} ago`);

    await Promise.all([
      expect.element(dateElement).toBeInTheDocument(),
      expect.element(screen.getByRole('tooltip')).not.toBeInTheDocument(),
    ]);
    await user.hover(dateElement);
    await expect.element(screen.getByRole('tooltip')).toMatchTextContent('2018-01-01 10:00');
  });

  it.each([
    [null, `Long URL: ${longUrl}`],
    [undefined, `Long URL: ${longUrl}`],
    ['My cool title', 'Title: My cool title'],
  ])('shows the long URL and title', async (title, expectedContent) => {
    const screen = await setUp(title);

    await Promise.all([
      expect.element(screen.getByTestId('long-url-container')).toMatchTextContent(expectedContent),
      expect.element(screen.getByRole('link', { name: title ?? longUrl })).toHaveAttribute('href', longUrl),
    ]);
  });
});
