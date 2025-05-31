import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/settings';
import { FeaturesProvider } from '../../src/utils/features';
import { OrphanVisitsFactory } from '../../src/visits/OrphanVisits';
import type { VisitsInfo } from '../../src/visits/reducers/types';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<OrphanVisits />', () => {
  const getOrphanVisits = vi.fn();
  const exportVisits = vi.fn();
  const orphanVisits = fromPartial<VisitsInfo>({ visits: [{ date: formatISO(new Date()) }] });
  const OrphanVisits = OrphanVisitsFactory(fromPartial({
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = (orphanVisitsDeletion = false) => renderWithEvents(
    <MemoryRouter>
      <SettingsProvider value={fromPartial({})}>
        <FeaturesProvider value={fromPartial({ orphanVisitsDeletion })}>
          <OrphanVisits
            {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
            getOrphanVisits={getOrphanVisits}
            orphanVisits={orphanVisits}
            cancelGetOrphanVisits={vi.fn()}
            deleteOrphanVisits={vi.fn()}
            orphanVisitsDeletion={fromPartial({})}
          />
        </FeaturesProvider>
      </SettingsProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', () => {
    setUp();
    expect(screen.getByRole('heading', { name: 'Orphan visits' })).toBeInTheDocument();
    expect(getOrphanVisits).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('orphan_visits.csv', expect.anything());
  });

  it.each([[false], [true]])('renders options menu when the feature is supported', (orphanVisitsDeletion) => {
    setUp(orphanVisitsDeletion);

    if (orphanVisitsDeletion) {
      expect(screen.getByRole('menuitem', { name: 'Options' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('menuitem', { name: 'Options' })).not.toBeInTheDocument();
    }
  });
});
