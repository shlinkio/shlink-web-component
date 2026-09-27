import type { ShlinkVisit } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { LoadVisitsForComparison } from '../../../src/visits/visits-comparison/reducers/types';
import { VisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { cleanup, renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  loading?: boolean;
  visitsGroups?: Record<string, ShlinkVisit[]>;
};

describe('<VisitsComparison />', () => {
  const visit = fromPartial<ShlinkVisit>({ date: '2020-01-01' });
  const getVisitsForComparison = vi.fn();
  const cancelGetVisitsComparison = vi.fn();
  const setUp = ({ loading = false, visitsGroups = {} }: SetUpOptions = {}) =>
    renderWithEvents(
      <MemoryRouter>
        <VisitsComparison
          title="Comparing visits"
          getVisitsForComparison={getVisitsForComparison}
          cancelGetVisitsComparison={cancelGetVisitsComparison}
          visitsComparisonInfo={loading ? { status: 'loading', progress: null } : { status: 'loaded', visitsGroups }}
        />
      </MemoryRouter>,
    );

  it.each([
    [{}],
    [{ loading: true }],
    [{ visitsGroups: { foo: [], bar: [] } }],
    [{ visitsGroups: { foo: [visit], bar: [visit] } }],
  ])('passes a11y checks', (options) => checkAccessibility(setUp(options)));

  it('disables filtering controls when loading', async () => {
    const screen = await setUp({ loading: true });

    await Promise.all([
      expect.element(screen.getByRole('button', { name: 'Last 30 days' })).toBeDisabled(),
      expect.element(screen.getByRole('button', { name: 'More' })).toBeDisabled(),
    ]);
  });

  it.each([[true], [false]])('does not display chart when loading', async (loading) => {
    const screen = await setUp({ loading, visitsGroups: { foo: [visit] } });

    if (loading) {
      await expect.element(screen.getByText(/Visits over time/)).not.toBeInTheDocument();
    } else {
      await expect.element(screen.getByText(/Visits over time/)).toBeInTheDocument();
    }
  });

  it.each([[{}], [{ foo: [] }], [{ foo: [], bar: [], baz: [] }]])(
    'shows fallback when all visits groups are empty',
    async (visitsGroups) => {
      const screen = await setUp({ loading: false, visitsGroups });

      await Promise.all([
        expect.element(screen.getByText('Visits over time')).not.toBeInTheDocument(),
        expect.element(screen.getByText('There are no visits matching current filter')).toBeInTheDocument(),
      ]);
    },
  );

  it('loads visits every time filters change', async () => {
    const { user, ...screen } = await setUp();
    const getLastCallParams = (): LoadVisitsForComparison => getVisitsForComparison.mock.lastCall?.[0];

    // First call when the component is mounted
    expect(getVisitsForComparison).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Last 30 days' }));
    await user.click(screen.getByRole('menuitem', { name: 'Yesterday' }));

    // FIXME
    // const { params: firstCallParams } = getLastCallParams();
    // expect(getVisitsForComparison).toHaveBeenCalledTimes(2);
    // expect(formatISO(firstCallParams.dateRange!.startDate!)).toEqual(formatISO(subDays(startOfDay(now), 1)));
    // expect(formatISO(firstCallParams.dateRange!.endDate!)).toEqual(formatISO(subDays(endOfDay(now), 1)));

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('menuitem', { name: 'Exclude potential bots' }));

    const { params: secondCallParams } = getLastCallParams();
    expect(secondCallParams.filter?.excludeBots).toEqual(true);
  });

  it('cancels loading visits when unmounted', async () => {
    await setUp();

    expect(cancelGetVisitsComparison).toHaveBeenCalledOnce();
    await cleanup();
    expect(cancelGetVisitsComparison).toHaveBeenCalledTimes(2);
  });
});
