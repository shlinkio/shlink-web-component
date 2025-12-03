import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl, ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import { now } from 'tinybench';
import { SettingsProvider } from '../../src/settings';
import { ShortUrlVisitsFactory } from '../../src/visits/ShortUrlVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<ShortUrlVisits />', () => {
  const exportVisits = vi.fn();
  const getShortUrlVisits = vi.fn().mockResolvedValue({
    data: [fromPartial({ date: formatISO(new Date()) })],
    pagination: { pagesCount: 1, totalItems: 1, currentPage: 1 },
  } satisfies ShlinkVisitsList);
  const ShortUrlVisits = ShortUrlVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = async () => {
    const renderResult = renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <ShortUrlVisits />
          </Card>
        </SettingsProvider>
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({
          getShortUrlVisits,
          getShortUrl: vi.fn().mockResolvedValue(fromPartial<ShlinkShortUrl>({
            shortUrl: 'https://s.test/123',
            longUrl: 'https://shlink.io',
            dateCreated: formatISO(now()),
          })),
        }),
      },
    );

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    await setUp();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Visits for');
    expect(getShortUrlVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = await setUp();

    expect(exportVisits).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Export (1)' }));
    expect(exportVisits).toHaveBeenCalledWith('short-url_s.test/123_visits.csv', expect.anything());
  });
});
