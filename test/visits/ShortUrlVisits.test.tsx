import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { identity } from 'ramda';
import { MemoryRouter } from 'react-router-dom';
import { now } from 'tinybench';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/utils/settings';
import type { ShortUrlVisits as ShortUrlVisitsState } from '../../src/visits/reducers/shortUrlVisits';
import type { ShortUrlVisitsProps } from '../../src/visits/ShortUrlVisits';
import { ShortUrlVisitsFactory } from '../../src/visits/ShortUrlVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<ShortUrlVisits />', () => {
  const getShortUrlVisitsMock = vi.fn();
  const exportVisits = vi.fn();
  const shortUrlVisits = fromPartial<ShortUrlVisitsState>({ visits: [{ date: formatISO(new Date()) }] });
  const ShortUrlVisits = ShortUrlVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithEvents(
    <MemoryRouter>
      <SettingsProvider value={fromPartial({})}>
        <ShortUrlVisits
          {...fromPartial<ShortUrlVisitsProps>({})}
          {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
          getShortUrlDetail={identity}
          getShortUrlVisits={getShortUrlVisitsMock}
          shortUrlVisits={shortUrlVisits}
          shortUrlDetail={fromPartial({
            shortUrl: {
              shortUrl: 'https://s.test/123',
              longUrl: 'https://shlink.io',
              dateCreated: formatISO(now()),
            },
          })}
          cancelGetShortUrlVisits={() => {}}
        />
      </SettingsProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', () => {
    setUp();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Visits for');
    expect(getShortUrlVisitsMock).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('short-url_s.test/123_visits.csv', expect.anything());
  });
});
