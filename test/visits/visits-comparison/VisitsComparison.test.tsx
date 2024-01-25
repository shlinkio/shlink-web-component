import type { ShlinkVisit } from '@shlinkio/shlink-js-sdk/api-contract';
import { cleanup, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { endOfDay, formatISO, startOfDay, subDays } from 'date-fns';
import { MemoryRouter } from 'react-router-dom';
import type { LoadVisitsForComparison } from '../../../src/visits/visits-comparison/reducers/types';
import { VisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  loading?: boolean;
  visitsGroups?: Record<string, ShlinkVisit[]>
};

describe('<VisitsComparison />', () => {
  const now = new Date();
  const visit = fromPartial<ShlinkVisit>({ date: '2020-01-01' });
  const getVisitsForComparison = vi.fn();
  const cancelGetVisitsComparison = vi.fn();
  const setUp = ({ loading = false, visitsGroups = {} }: SetUpOptions = {}) => renderWithEvents(
    <MemoryRouter>
      <VisitsComparison
        title="Comparing visits"
        getVisitsForComparison={getVisitsForComparison}
        cancelGetVisitsComparison={cancelGetVisitsComparison}
        visitsComparisonInfo={fromPartial({ loading, visitsGroups, progress: null })}
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
    const { user } = setUp({ loading: true });

    await user.click(screen.getByRole('button', { name: 'Last 30 days' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it.each([[true], [false]])('does not display chart when loading', (loading) => {
    setUp({ loading, visitsGroups: { foo: [visit] } });

    if (loading) {
      expect(screen.queryByText('Visits over time')).not.toBeInTheDocument();
    } else {
      expect(screen.getByText('Visits over time')).toBeInTheDocument();
    }
  });

  it.each([
    [{}],
    [{ foo: [] }],
    [{ foo: [], bar: [], baz: [] }],
  ])('shows fallback when all visits groups are empty', (visitsGroups) => {
    setUp({ loading: false, visitsGroups });

    expect(screen.queryByText('Visits over time')).not.toBeInTheDocument();
    expect(screen.getByText('There are no visits matching current filter')).toBeInTheDocument();
  });

  it('loads visits every time filters change', async () => {
    const { user } = setUp();
    const getLastCallParams = (): LoadVisitsForComparison => getVisitsForComparison.mock.lastCall[0];

    // First call when the component is mounted
    expect(getVisitsForComparison).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Last 30 days' }));
    await user.click(screen.getByRole('menuitem', { name: 'Yesterday' }));

    const { params: firstCallParams } = getLastCallParams();
    expect(getVisitsForComparison).toHaveBeenCalledTimes(2);
    expect(formatISO(firstCallParams.dateRange!.startDate!)).toEqual(formatISO(subDays(startOfDay(now), 1)));
    expect(formatISO(firstCallParams.dateRange!.endDate!)).toEqual(formatISO(subDays(endOfDay(now), 1)));

    await user.click(screen.getByRole('button', { name: 'More' }));
    await user.click(screen.getByRole('menuitem', { name: 'Exclude potential bots' }));

    const { params: secondCallParams } = getLastCallParams();
    expect(getVisitsForComparison).toHaveBeenCalledTimes(3);
    expect(secondCallParams.filter?.excludeBots).toEqual(true);
  });

  it('cancels loading visits when unmounted', () => {
    setUp();

    expect(cancelGetVisitsComparison).not.toHaveBeenCalled();
    cleanup();
    expect(cancelGetVisitsComparison).toHaveBeenCalledOnce();
  });
});
