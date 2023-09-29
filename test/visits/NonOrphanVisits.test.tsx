import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router-dom';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/utils/settings';
import { NonOrphanVisitsFactory } from '../../src/visits/NonOrphanVisits';
import type { VisitsInfo } from '../../src/visits/reducers/types';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<NonOrphanVisits />', () => {
  const exportVisits = vi.fn();
  const getNonOrphanVisits = vi.fn();
  const cancelGetNonOrphanVisits = vi.fn();
  const nonOrphanVisits = fromPartial<VisitsInfo>({ visits: [{ date: formatISO(new Date()) }] });
  const NonOrphanVisits = NonOrphanVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithEvents(
    <MemoryRouter>
      <SettingsProvider value={fromPartial({})}>
        <NonOrphanVisits
          {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
          getNonOrphanVisits={getNonOrphanVisits}
          cancelGetNonOrphanVisits={cancelGetNonOrphanVisits}
          nonOrphanVisits={nonOrphanVisits}
        />
      </SettingsProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', () => {
    setUp();
    expect(screen.getByRole('heading', { name: 'Non-orphan visits' })).toBeInTheDocument();
    expect(getNonOrphanVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('non_orphan_visits.csv', expect.anything());
  });
});
