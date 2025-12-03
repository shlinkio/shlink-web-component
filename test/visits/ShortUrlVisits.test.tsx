import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import { now } from 'tinybench';
import { SettingsProvider } from '../../src/settings';
import type { ShortUrlVisits as ShortUrlVisitsState } from '../../src/visits/reducers/shortUrlVisits';
import { ShortUrlVisitsFactory } from '../../src/visits/ShortUrlVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<ShortUrlVisits />', () => {
  const getShortUrlVisitsMock = vi.fn();
  const exportVisits = vi.fn();
  const shortUrlVisits = fromPartial<ShortUrlVisitsState>({ visits: [{ date: formatISO(new Date()) }] });
  const ShortUrlVisits = ShortUrlVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = async () => {
    const renderResult = renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <ShortUrlVisits
              getShortUrlVisits={getShortUrlVisitsMock}
              shortUrlVisits={shortUrlVisits}
              cancelGetShortUrlVisits={vi.fn()}
            />
          </Card>
        </SettingsProvider>
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({
          getShortUrl: vi.fn().mockResolvedValue(fromPartial<ShlinkShortUrl>({
            shortUrl: 'https://s.test/123',
            longUrl: 'https://shlink.io',
            dateCreated: formatISO(now()),
          })),
        }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    await setUp();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Visits for');
    expect(getShortUrlVisitsMock).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = await setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('short-url_s.test/123_visits.csv', expect.anything());
  });
});
