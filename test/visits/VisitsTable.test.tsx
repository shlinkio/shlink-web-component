import { fromPartial } from '@total-typescript/shoehorn';
import type { VisitsListSettings } from '../../src/settings';
import { defaultVisitsListColumns, SettingsProvider } from '../../src/settings';
import { rangeOf } from '../../src/utils/helpers';
import type { NormalizedRegularVisit, NormalizedVisit } from '../../src/visits/types';
import type { VisitsTableProps } from '../../src/visits/VisitsTable';
import { VisitsTable } from '../../src/visits/VisitsTable';
import { checkAccessibility } from '../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = Partial<VisitsTableProps> & {
  visitsList?: VisitsListSettings;
};

describe('<VisitsTable />', () => {
  const setSelectedVisits = vi.fn();
  const setUpFactory = ({ visitsList, ...props }: SetUpOptions = {}) =>
    renderWithEvents(
      <SettingsProvider value={fromPartial({ visitsList })}>
        <VisitsTable visits={[]} {...props} setSelectedVisits={setSelectedVisits} />
      </SettingsProvider>,
    );
  const setUp = (visits: NormalizedVisit[] = [], selectedVisits: NormalizedVisit[] = []) =>
    setUpFactory({ visits, selectedVisits });
  const setUpWithBots = () =>
    setUpFactory({
      visits: [
        fromPartial({ potentialBot: false, date: '2022-05-05' }),
        fromPartial({ potentialBot: true, date: '2022-05-05' }),
      ],
    });
  const setUpWithSettings = (visitsList: VisitsListSettings) => setUpFactory({ visitsList });

  const getFirstColumnValue = (screen: RenderWithEventsResult) =>
    screen.getByRole('row').elements()[2]?.querySelectorAll('td')[3]?.textContent;
  const clickColumn = async ({ user, ...screen }: RenderWithEventsResult, index: number) =>
    user.click(screen.getByRole('columnheader').all()[index]);

  it('passes a11y checks', () => checkAccessibility(setUpWithBots()));

  it('renders expected amount of columns', async () => {
    const screen = await setUp();
    expect(screen.getByRole('columnheader').all()).toHaveLength(10);
  });

  it('shows warning when no visits are found', async () => {
    const screen = await setUp();
    await expect.element(screen.getByText('There are no visits matching current filter')).toBeInTheDocument();
  });

  it.each(rangeOf(20, (value) => [value]))(
    'does not render footer when there is only one page to render',
    async (visitsCount) => {
      const { container, ...screen } = await setUp(
        rangeOf(visitsCount, () => fromPartial<NormalizedVisit>({ browser: '', date: '2022-01-01', referer: '' })),
      );

      await Promise.all([
        expect.element(container.querySelector('tfoot')).not.toBeInTheDocument(),
        expect.element(screen.getByLabelText('pagination')).not.toBeInTheDocument(),
      ]);
    },
  );

  it('selected rows are highlighted', async () => {
    const visits = rangeOf(10, () => fromPartial<NormalizedVisit>({ browser: '', date: '2022-01-01', referer: '' }));
    const { container, user, ...screen } = await setUp(visits, [visits[1], visits[2]]);

    // Initial situation
    expect(container.querySelectorAll('.bg-lm-table-highlight')).toHaveLength(2);

    // Select one extra
    await user.click(screen.getByRole('row').all()[5]);
    expect(setSelectedVisits).toHaveBeenCalledWith([visits[1], visits[2], visits[4]]);

    // Deselect one
    await user.click(screen.getByRole('row').all()[3]);
    expect(setSelectedVisits).toHaveBeenCalledWith([visits[1]]);

    // Select all
    await user.click(screen.getByRole('columnheader').first());
    expect(setSelectedVisits).toHaveBeenCalledWith(visits);
  });

  it('orders visits when column is clicked', async () => {
    const screen = await setUp(
      rangeOf(9, (index) =>
        fromPartial<NormalizedVisit>({
          browser: '',
          date: `2022-01-0${10 - index}`,
          referer: `${index}`,
          country: `Country_${index}`,
        }),
      ),
    );

    expect(getFirstColumnValue(screen)).toContain('Country_1');
    await clickColumn(screen, 2); // Date column ASC
    expect(getFirstColumnValue(screen)).toContain('Country_9');
    await clickColumn(screen, 7); // Referer column - ASC
    expect(getFirstColumnValue(screen)).toContain('Country_1');
    await clickColumn(screen, 7); // Referer column - DESC
    expect(getFirstColumnValue(screen)).toContain('Country_9');
    await clickColumn(screen, 7); // Referer column - reset
    expect(getFirstColumnValue(screen)).toContain('Country_1');
  });

  it('filters list when writing in search box', async () => {
    const { user, ...screen } = await setUp([
      ...rangeOf(7, () => fromPartial<NormalizedVisit>({ browser: 'aaa', date: '2022-01-01', referer: 'aaa' })),
      ...rangeOf(2, () => fromPartial<NormalizedVisit>({ browser: 'bbb', date: '2022-01-01', referer: 'bbb' })),
    ]);
    const searchField = screen.getByPlaceholder('Search...');
    const searchText = async (text: string) => {
      await user.clear(searchField);
      if (text.length > 0) {
        await user.type(searchField, text);
      }
    };

    expect(screen.getByRole('row').all()).toHaveLength(9 + 2);
    await searchText('aa');
    await expect.poll(() => screen.getByRole('row').all()).toHaveLength(7 + 2);
    await searchText('bb');
    await expect.poll(() => screen.getByRole('row').all()).toHaveLength(2 + 2);
    await searchText('');
    await expect.poll(() => screen.getByRole('row').all()).toHaveLength(9 + 2);
  });

  it('resets selected visits when search term changes', async () => {
    const visits = rangeOf(50, (index) =>
      fromPartial<NormalizedVisit>({ country: `country${index}`, browser: '', date: '2022-01-01', referer: '' }),
    );
    const { user, ...screen } = await setUp(visits, [visits[1], visits[2]]);

    // Jump to second page, and then set some filtering text
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.type(screen.getByPlaceholder('Search...'), 'foo');

    // Search is deferred, so let's wait for it to apply
    await screen.getByText('There are no visits matching current filter').findElement();

    expect(setSelectedVisits).toHaveBeenCalledWith([]);
  });

  it.each([{ withVisitedUrl: true }, { withVisitedUrl: false }])(
    'displays proper amount of columns based on visited URL',
    async ({ withVisitedUrl }) => {
      const screen = await setUp([
        fromPartial<NormalizedRegularVisit>({
          visitedUrl: withVisitedUrl ? 'visited_url' : undefined,
          date: '2020-01-01T09:09:09',
        }),
      ]);

      const cells = screen.getByRole('cell').all();
      const lastCell = cells[cells.length - 1];

      expect(screen.getByRole('columnheader').all()).toHaveLength(withVisitedUrl ? 10 : 9);
      if (withVisitedUrl) {
        await expect.element(lastCell).toHaveTextContent('visited_url');
      } else {
        await expect.element(lastCell).not.toHaveTextContent('visited_url');
      }
    },
  );

  it('displays bots icon when a visit is a potential bot', async () => {
    const screen = await setUpWithBots();
    const [, , nonBotVisitRow, botVisitRow] = screen.getByRole('row').elements();

    await Promise.all([
      expect.element(nonBotVisitRow.querySelectorAll('td')[1]).toBeEmptyDOMElement(),
      expect.element(botVisitRow.querySelectorAll('td')[1]).not.toBeEmptyDOMElement(),
    ]);
  });

  it.each([
    defaultVisitsListColumns,
    {
      potentialBot: false,
      date: true,
      country: true,
      region: false,
      city: true,
      browser: true,
      os: true,
      userAgent: false,
      referer: false,
      visitedUrl: false,
    } satisfies Required<VisitsListSettings['columns']>,
    {
      potentialBot: true,
      date: true,
      country: true,
      region: true,
      city: true,
      browser: false,
      os: false,
      userAgent: true,
      referer: false,
      visitedUrl: true,
    } satisfies Required<VisitsListSettings['columns']>,
    {
      potentialBot: false,
      date: false,
      country: false,
      region: false,
      city: false,
      browser: false,
      os: false,
      userAgent: false,
      referer: false,
      visitedUrl: false,
    } satisfies Required<VisitsListSettings['columns']>,
  ])('only shows enabled columns', async (columns) => {
    const screen = await setUpWithSettings({ columns });

    const columnEntries = Object.entries(columns);
    const enabledColumnEntries = columnEntries.filter(([, enabled]) => enabled);

    // Add 2, for the search bar and the selected column, which are always displayed
    expect(screen.getByRole('columnheader').all()).toHaveLength(enabledColumnEntries.length + 2);
  });
});
