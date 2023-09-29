import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import { MemoryRouter } from 'react-router';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/utils/settings';
import type { TagVisits as TagVisitsStats } from '../../src/visits/reducers/tagVisits';
import type { TagVisitsProps } from '../../src/visits/TagVisits';
import { TagVisitsFactory } from '../../src/visits/TagVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<any>('react-router-dom')),
  useParams: vi.fn().mockReturnValue({ tag: 'foo' }),
}));

describe('<TagVisits />', () => {
  const getTagVisitsMock = vi.fn();
  const exportVisits = vi.fn();
  const tagVisits = fromPartial<TagVisitsStats>({ visits: [{ date: formatISO(new Date()) }] });
  const TagVisits = TagVisitsFactory(fromPartial({
    ColorGenerator: fromPartial({ isColorLightForKey: () => false, getColorForKey: () => 'red' }),
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithEvents(
    <MemoryRouter>
      <SettingsProvider value={fromPartial({})}>
        <TagVisits
          {...fromPartial<TagVisitsProps>({})}
          {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
          getTagVisits={getTagVisitsMock}
          tagVisits={tagVisits}
          cancelGetTagVisits={() => {}}
        />
      </SettingsProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps visits stats and header', () => {
    setUp();
    expect(screen.getAllByRole('heading')[0]).toHaveTextContent('Visits for');
    expect(getTagVisitsMock).toHaveBeenCalled();
  });

  it('exports visits when clicking the button', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button', { name: 'Export (1)' });

    expect(exportVisits).not.toHaveBeenCalled();
    expect(btn).toBeInTheDocument();

    await user.click(btn);
    expect(exportVisits).toHaveBeenCalledWith('tag_foo_visits.csv', expect.anything());
  });
});
