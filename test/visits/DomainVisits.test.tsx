import { Card } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { SettingsProvider } from '../../src/settings';
import { DomainVisitsFactory } from '../../src/visits/DomainVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<DomainVisits />', () => {
  const exportVisits = vi.fn();
  const domainVisits = fromPartial<ShlinkVisitsList>({
    data: [{ date: formatISO(new Date()) }],
    pagination: { currentPage: 1, pagesCount: 1, totalItems: 1 },
  });
  const getDomainVisits = vi.fn().mockResolvedValue(domainVisits);
  const DomainVisits = DomainVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = async () => {
    const renderResult = renderWithStore(
      <MemoryRouterWithParams params={{ domain: 'foo.com_DEFAULT' }} splat>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <DomainVisits />
          </Card>
        </SettingsProvider>
      </MemoryRouterWithParams>,
      {
        apiClientFactory: () => fromPartial({ getDomainVisits }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', async () => {
    await setUp();
    expect(screen.getByRole('heading', { name: '"foo.com" visits' })).toBeInTheDocument();
    expect(getDomainVisits).toHaveBeenCalledWith('DEFAULT', expect.anything());
  });

  it('exports visits when clicking the button', async () => {
    const { user } = await setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('domain_foo.com_visits.csv', expect.anything());
  });
});
