import { Card } from '@shlinkio/shlink-frontend-kit';
import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { ContainerProvider } from '../../src/container/context';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/settings';
import { DomainVisitsFactory } from '../../src/visits/DomainVisits';
import type { DomainVisits } from '../../src/visits/reducers/domainVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<DomainVisits />', () => {
  const exportVisits = vi.fn();
  const getDomainVisits = vi.fn();
  const cancelGetDomainVisits = vi.fn();
  const domainVisits = fromPartial<DomainVisits>({ visits: [{ date: formatISO(new Date()) }] });
  const DomainVisits = DomainVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithStore(
    <ContainerProvider value={fromPartial({ apiClientFactory: vi.fn() })}>
      <MemoryRouterWithParams params={{ domain: 'foo.com_DEFAULT' }} splat>
        <SettingsProvider value={fromPartial({})}>
          {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
          <Card>
            <DomainVisits
              {...fromPartial<MercureBoundProps>({})}
              getDomainVisits={getDomainVisits}
              cancelGetDomainVisits={cancelGetDomainVisits}
              domainVisits={domainVisits}
            />
          </Card>
        </SettingsProvider>
      </MemoryRouterWithParams>
    </ContainerProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', () => {
    setUp();
    expect(screen.getByRole('heading', { name: '"foo.com" visits' })).toBeInTheDocument();
    expect(getDomainVisits).toHaveBeenCalledWith(expect.objectContaining({ domain: 'DEFAULT' }));
  });

  it('exports visits when clicking the button', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('domain_foo.com_visits.csv', expect.anything());
  });
});
