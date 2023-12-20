import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO } from 'date-fns';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import { SettingsProvider } from '../../src/utils/settings';
import type { TagVisits as TagVisitsStats } from '../../src/visits/reducers/tagVisits';
import type { TagVisitsProps } from '../../src/visits/TagVisits';
import { TagVisitsFactory } from '../../src/visits/TagVisits';
import { checkAccessibility } from '../__helpers__/accessibility';
import { MemoryRouterWithParams } from '../__helpers__/MemoryRouterWithParams';
import { renderWithEvents } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisits />', () => {
  const getTagVisitsMock = vi.fn();
  const exportVisits = vi.fn();
  const tagVisits = fromPartial<TagVisitsStats>({ visits: [{ date: formatISO(new Date()) }] });
  const TagVisits = TagVisitsFactory(fromPartial({
    ColorGenerator: colorGeneratorMock,
    ReportExporter: fromPartial({ exportVisits }),
  }));
  const setUp = () => renderWithEvents(
    <MemoryRouterWithParams params={{ tag: 'foo' }}>
      <SettingsProvider value={fromPartial({})}>
        <TagVisits
          {...fromPartial<TagVisitsProps>({})}
          {...fromPartial<MercureBoundProps>({ mercureInfo: {} })}
          getTagVisits={getTagVisitsMock}
          tagVisits={tagVisits}
          cancelGetTagVisits={() => {}}
        />
      </SettingsProvider>
    </MemoryRouterWithParams>,
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
