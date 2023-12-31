import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import type { ShlinkVisit } from '../../src/api-contract';
import { rangeOf } from '../../src/utils/helpers';
import { SettingsProvider } from '../../src/utils/settings';
import type { VisitsInfo } from '../../src/visits/reducers/types';
import { VisitsStats } from '../../src/visits/VisitsStats';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = {
  visitsInfo?: Partial<VisitsInfo>;
  withDeletion?: boolean;
  activeRoute?: string;
};

describe('<VisitsStats />', () => {
  const visits = rangeOf(3, () => fromPartial<ShlinkVisit>({ date: '2020-01-01' }));
  const getVisitsMock = vi.fn();
  const exportCsv = vi.fn();
  const setUp = ({ visitsInfo = {}, activeRoute = '/by-time', withDeletion }: SetUpOptions = {}) => {
    const history = createMemoryHistory();
    history.push(activeRoute);

    return {
      history,
      ...renderWithEvents(
        <Router location={history.location} navigator={history}>
          <SettingsProvider value={fromPartial({})}>
            <VisitsStats
              getVisits={getVisitsMock}
              visitsInfo={fromPartial({ loading: false, errorData: null, progress: null, visits: [], ...visitsInfo })}
              cancelGetVisits={() => {}}
              exportCsv={exportCsv}
              deletion={withDeletion ? fromPartial({ visitsDeletion: {} }) : undefined}
            />
          </SettingsProvider>
        </Router>,
      ),
    };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders a preloader when visits are loading', () => {
    setUp({
      visitsInfo: { loading: true, progress: null },
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText(/^This is going to take a while/)).not.toBeInTheDocument();
  });

  it('renders a warning and progress bar when loading large amounts of visits', () => {
    setUp({
      visitsInfo: { loading: true, progress: 25 },
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText(/^This is going to take a while/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('renders an error message when visits could not be loaded', () => {
    setUp({
      visitsInfo: { errorData: fromPartial({ }) },
    });
    expect(screen.getByText('An error occurred while loading visits :(')).toBeInTheDocument();
  });

  it('renders a message when visits are loaded but the list is empty', () => {
    setUp({
      visitsInfo: { visits: [] },
    });
    expect(screen.getByText('There are no visits matching current filter')).toBeInTheDocument();
  });

  it.each([
    ['/by-time', 2],
    ['/by-context', 4],
    ['/by-location', 3],
    ['/list', 1],
    ['/options', 2],
  ])('renders expected amount of cards per sub-route', (activeRoute, expectedCards) => {
    const { container } = setUp({ visitsInfo: { visits }, activeRoute, withDeletion: true });
    expect(container.querySelectorAll('.card')).toHaveLength(expectedCards);
  });

  it('renders danger zone in options sub-route', () => {
    setUp({ visitsInfo: { visits }, activeRoute: '/options', withDeletion: true });

    expect(screen.getByText('Danger zone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete visits' })).toBeInTheDocument();
  });

  it('holds the map button on cities chart header', () => {
    setUp({ visitsInfo: { visits }, activeRoute: '/by-location' });
    expect(
      screen.getAllByRole('img', { hidden: true }).some((icon) => icon.classList.contains('fa-map-location-dot')),
    ).toEqual(true);
  });

  it('exports CSV when export btn is clicked', async () => {
    const { user } = setUp({ visitsInfo: { visits } });

    expect(exportCsv).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Export/ }));
    expect(exportCsv).toHaveBeenCalled();
  });

  it('sets filters in query string', async () => {
    const { history, user } = setUp({ visitsInfo: { visits } });
    const expectSearchContains = (contains: string[]) => {
      expect(contains).not.toHaveLength(0);
      contains.forEach((entry) => expect(history.location.search).toContain(entry));
    };

    expect(history.location.search).toEqual('');

    await user.click(screen.getByRole('button', { name: /Filters/ }));
    await waitFor(() => screen.getByRole('menu'));
    await user.click(screen.getByRole('menuitem', { name: 'Exclude potential bots' }));
    expectSearchContains(['excludeBots=true']);

    await user.click(screen.getByRole('button', { name: /Last 30 days/ }));
    await waitFor(() => screen.getByRole('menu'));
    await user.click(screen.getByRole('menuitem', { name: /Last 180 days/ }));
    expectSearchContains(['startDate', 'endDate']);
  });
});
