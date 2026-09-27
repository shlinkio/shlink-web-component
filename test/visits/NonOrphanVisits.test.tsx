import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import { SettingsProvider } from '../../src/settings';
import { NonOrphanVisits } from '../../src/visits/NonOrphanVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<NonOrphanVisits />', () => {
  const exportVisits = vi.fn();
  const nonOrphanVisits = fromPartial<ShlinkVisitsList>({
    data: [{ date: formatISO(new Date()) }],
    pagination: { currentPage: 1, pagesCount: 1, totalItems: 1 },
  });
  const getNonOrphanVisits = vi.fn().mockResolvedValue(nonOrphanVisits);
  const setUp = () =>
    renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <NonOrphanVisits ReportExporter={fromPartial({ exportVisits })} />
          </Card>
        </SettingsProvider>
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({ getNonOrphanVisits }),
      },
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    const screen = await setUp();

    await expect.element(screen.getByRole('heading', { name: 'Non-orphan visits' })).toBeInTheDocument();
    expect(getNonOrphanVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user, ...screen } = await setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    await expect.element(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('non_orphan_visits.csv', expect.anything());
  });
});
