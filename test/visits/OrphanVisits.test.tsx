import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import { SettingsProvider } from '../../src/settings';
import { OrphanVisitsFactory } from '../../src/visits/OrphanVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<OrphanVisits />', () => {
  const exportVisits = vi.fn();
  const orphanVisits = fromPartial<ShlinkVisitsList>({
    data: [{ date: formatISO(new Date()) }],
    pagination: { pagesCount: 1, currentPage: 1, totalItems: 1 },
  });
  const getOrphanVisits = vi.fn().mockResolvedValue(orphanVisits);
  const OrphanVisits = OrphanVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = async () => {
    const renderResult = renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <OrphanVisits />
          </Card>
        </SettingsProvider>
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({ getOrphanVisits }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    await setUp();
    expect(screen.getByRole('heading', { name: 'Orphan visits' })).toBeInTheDocument();
    expect(getOrphanVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = await setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('orphan_visits.csv', expect.anything());
  });
});
