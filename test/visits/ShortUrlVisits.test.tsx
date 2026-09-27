import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl, ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import { now } from 'tinybench';
import { SettingsProvider } from '../../src/settings';
import { ShortUrlVisits } from '../../src/visits/ShortUrlVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<ShortUrlVisits />', () => {
  const exportVisits = vi.fn();
  const getShortUrlVisits = vi.fn().mockResolvedValue({
    data: [fromPartial({ date: formatISO(new Date()) })],
    pagination: { pagesCount: 1, totalItems: 1, currentPage: 1 },
  } satisfies ShlinkVisitsList);
  const setUp = async () => {
    const screen = await renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <ShortUrlVisits ReportExporter={fromPartial({ exportVisits })} />
          </Card>
        </SettingsProvider>
      </MemoryRouter>,
      {
        apiClientFactory: () =>
          fromPartial({
            getShortUrlVisits,
            getShortUrl: vi.fn().mockResolvedValue(
              fromPartial<ShlinkShortUrl>({
                shortUrl: 'https://s.test/123',
                longUrl: 'https://shlink.io',
                dateCreated: formatISO(now()),
              }),
            ),
          }),
      },
    );

    // Wait for loading to finish
    await expect.element(screen.getByText('Loading...')).not.toBeInTheDocument();

    return screen;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    const screen = await setUp();

    await expect.element(screen.getByRole('heading').first()).toMatchTextContent('Visits for');
    expect(getShortUrlVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user, ...screen } = await setUp();

    expect(exportVisits).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Export (1)' }));
    expect(exportVisits).toHaveBeenCalledWith('short-url_s.test/123_visits.csv', expect.anything());
  });
});
