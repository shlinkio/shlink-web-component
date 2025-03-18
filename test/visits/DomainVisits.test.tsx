import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/settings';
import { DomainVisitsFactory } from '../../src/visits/DomainVisits';
import type { DomainVisits } from '../../src/visits/reducers/domainVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<DomainVisits />', () => {
  const exportVisits = vi.fn();
  const getDomainVisits = vi.fn();
  const cancelGetDomainVisits = vi.fn();
  const domainVisits = fromPartial<DomainVisits>({ visits: [{ date: formatISO(new Date()) }] });
  const DomainVisits = DomainVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithEvents(
    <MemoryRouterWithParams params={{ domain: 'foo.com_DEFAULT' }} splat>
      <SettingsProvider value={fromPartial({})}>
        <DomainVisits
          {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
          getDomainVisits={getDomainVisits}
          cancelGetDomainVisits={cancelGetDomainVisits}
          domainVisits={domainVisits}
        />
      </SettingsProvider>
    </MemoryRouterWithParams>,
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
