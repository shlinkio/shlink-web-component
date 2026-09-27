import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import type { ShlinkVisit } from '../../src/api-contract';
import type { Domain } from '../../src/domains/data';
import { DEFAULT_DOMAIN } from '../../src/domains/data';
import type { Settings } from '../../src/settings';
import { SettingsProvider } from '../../src/settings';
import { FeaturesProvider } from '../../src/utils/features';
import { rangeOf } from '../../src/utils/helpers';
import { ChartDimensionsProvider } from '../../src/visits/charts/ChartDimensionsContext';
import type { VisitsInfo } from '../../src/visits/reducers/types';
import { VisitsStats } from '../../src/visits/VisitsStats';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = {
  visitsInfo?: Partial<VisitsInfo>;
  withDeletion?: boolean;
  activeRoute?: string;
  settings?: Partial<Settings>;
  domains?: Domain[];
  filterByDomainSupported?: boolean;
};

describe('<VisitsStats />', () => {
  const visits = rangeOf(3, () => fromPartial<ShlinkVisit>({ date: '2020-01-01' }));
  const getVisitsMock = vi.fn();
  const exportCsv = vi.fn();
  const setUp = async ({
    visitsInfo = {},
    activeRoute = '/by-time',
    withDeletion,
    settings = {},
    domains,
    filterByDomainSupported = false,
  }: SetUpOptions = {}) => {
    const history = createMemoryHistory();
    history.push(activeRoute);
    const renderResult = await renderWithEvents(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={fromPartial(settings)}>
          <FeaturesProvider value={fromPartial({ filterVisitsByDomain: filterByDomainSupported })}>
            <ChartDimensionsProvider value={{ width: 800, height: 300 }}>
              <VisitsStats
                getVisits={getVisitsMock}
                visitsInfo={fromPartial({
                  status: 'loaded',
                  visits: [],
                  ...visitsInfo,
                })}
                cancelGetVisits={() => {}}
                exportCsv={exportCsv}
                deletion={withDeletion ? fromPartial({ visitsDeletion: {} }) : undefined}
                domains={domains}
              />
            </ChartDimensionsProvider>
          </FeaturesProvider>
        </SettingsProvider>
      </Router>,
    );

    return { history, ...renderResult };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders a preloader when visits are loading', async () => {
    const screen = await setUp({
      visitsInfo: { status: 'loading', progress: null },
    });

    await Promise.all([
      expect.element(screen.getByText('Loading...')).toBeInTheDocument(),
      expect.element(screen.getByText(/^This is going to take a while/)).not.toBeInTheDocument(),
    ]);
  });

  it('renders a warning and progress bar when loading large amounts of visits', async () => {
    const screen = await setUp({
      visitsInfo: { status: 'loading', progress: 25 },
    });

    await Promise.all([
      expect.element(screen.getByText('Loading...')).not.toBeInTheDocument(),
      expect.element(screen.getByText(/^This is going to take a while/)).toBeInTheDocument(),
      expect.element(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25'),
    ]);
  });

  it('renders an error message when visits could not be loaded', async () => {
    const screen = await setUp({
      visitsInfo: { status: 'error', error: fromPartial({}) },
    });
    await expect.element(screen.getByText('An error occurred while loading visits :(')).toBeInTheDocument();
  });

  it('renders a message when visits are loaded but the list is empty', async () => {
    const screen = await setUp({
      visitsInfo: { visits: [] },
    });
    await expect.element(screen.getByText('There are no visits matching current filter')).toBeInTheDocument();
  });

  it.each([
    ['/by-time', ['Visits over time']],
    ['/by-context', ['Operating systems', 'Browsers', 'Referrers']],
    ['/by-location', ['Countries', 'Cities']],
    ['/list', ['Visits list']],
    ['/options', ['Danger zone']],
  ])('renders expected cards per sub-route', async (activeRoute, expectedCards) => {
    const screen = await setUp({ visitsInfo: { visits }, activeRoute, withDeletion: true });

    await Promise.all(
      expectedCards.map((cardTitle) => expect.element(screen.getByText(new RegExp(cardTitle))).toBeInTheDocument()),
    );
  });

  it('renders danger zone in options sub-route', async () => {
    const screen = await setUp({ visitsInfo: { visits }, activeRoute: '/options', withDeletion: true });

    await Promise.all([
      expect.element(screen.getByText('Danger zone')).toBeInTheDocument(),
      expect.element(screen.getByRole('button', { name: 'Delete visits' })).toBeInTheDocument(),
    ]);
  });

  it('shows the map button on cities chart header', async () => {
    const screen = await setUp({ visitsInfo: { visits }, activeRoute: '/by-location' });
    expect(
      screen
        .getByRole('img', { includeHidden: true })
        .elements()
        .some((icon) => icon.classList.contains('fa-map-location-dot')),
    ).toEqual(true);
  });

  it.each([
    { activeRoute: '/by-time', prevVisits: undefined, shouldShowMessage: true },
    { activeRoute: '/by-context', prevVisits: undefined, shouldShowMessage: true },
    { activeRoute: '/by-location', prevVisits: undefined, shouldShowMessage: true },
    { activeRoute: '/by-time', prevVisits: [], shouldShowMessage: false },
    { activeRoute: '/by-context', prevVisits: [], shouldShowMessage: false },
    { activeRoute: '/by-location', prevVisits: [], shouldShowMessage: false },
    { activeRoute: '/list', prevVisits: undefined, shouldShowMessage: false },
    { activeRoute: '/list', prevVisits: [], shouldShowMessage: false },
  ])(
    'displays message when trying to load prev visits and prev interval cannot be calculated',
    async ({ activeRoute, prevVisits, shouldShowMessage }) => {
      const settings = fromPartial<Settings>({ visits: { loadPrevInterval: true } });
      const screen = await setUp({ visitsInfo: { visits, prevVisits }, activeRoute, settings });

      if (shouldShowMessage) {
        await expect.element(screen.getByText(/^Could not calculate previous period/)).toBeInTheDocument();
      } else {
        await expect.element(screen.getByText(/^Could not calculate previous period/)).not.toBeInTheDocument();
      }
    },
  );

  it('exports CSV when export btn is clicked', async () => {
    const { user, ...screen } = await setUp({ visitsInfo: { visits } });

    expect(exportCsv).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /Export/ }));
    expect(exportCsv).toHaveBeenCalled();
  });

  it('sets filters in query string', async () => {
    const { history, user, ...screen } = await setUp({ visitsInfo: { visits } });
    const expectSearchContains = (contains: string[]) => {
      expect(contains).not.toHaveLength(0);
      contains.forEach((entry) => expect(history.location.search).toContain(entry));
    };

    expect(history.location.search).toEqual('');

    await user.click(screen.getByRole('button', { name: /More/ }));
    await screen.getByRole('menu').findElement();
    await user.click(screen.getByRole('menuitem', { name: 'Exclude potential bots' }));
    expectSearchContains(['excludeBots=true']);

    await user.click(screen.getByRole('button', { name: /Last 30 days/ }));
    await screen.getByRole('menu').findElement();
    await user.click(screen.getByRole('menuitem', { name: /Last 180 days/ }));
    expectSearchContains(['startDate', 'endDate']);
  });

  it.each([
    { domains: undefined, filterByDomainSupported: false },
    { domains: [], filterByDomainSupported: false },
    { domains: undefined, filterByDomainSupported: true },
    { domains: [], filterByDomainSupported: true },
  ])(
    'shows domains filtering control when domains are provided and the feature is supported',
    async ({ domains, filterByDomainSupported }) => {
      const screen = await setUp({ domains, filterByDomainSupported });

      if (domains && filterByDomainSupported) {
        await expect.element(screen.getByRole('button', { name: 'All domains' })).toBeInTheDocument();
      } else {
        await expect.element(screen.getByRole('button', { name: 'All domains' })).not.toBeInTheDocument();
      }
    },
  );

  it.each([
    { selectedDomain: /^foo/, expectedFilter: DEFAULT_DOMAIN },
    { selectedDomain: 'bar', expectedFilter: 'bar' },
  ])('can change domain to filter by', async ({ selectedDomain, expectedFilter }) => {
    const { history, user, ...screen } = await setUp({
      domains: [fromPartial({ isDefault: true, domain: 'foo' }), fromPartial({ domain: 'bar' })],
      filterByDomainSupported: true,
    });

    await user.click(screen.getByRole('button', { name: 'All domains' }));
    await user.click(screen.getByRole('menuitem', { name: selectedDomain }));

    expect(history.location.search).toContain(`domain=${expectedFilter}`);
  });

  // FIXME Snapshots do not match when run in CI, because it generate some slightly off coordinates.
  //       I Need to investigate why.
  it.skipIf(import.meta.env.CI).each([
    { loadPrevInterval: undefined, prevVisits: undefined },
    { loadPrevInterval: true, prevVisits: undefined },
    { loadPrevInterval: false, prevVisits: undefined },
    { loadPrevInterval: undefined, prevVisits: visits },
    { loadPrevInterval: true, prevVisits: visits },
    { loadPrevInterval: false, prevVisits: visits },
  ])('loads visits when mounted', async ({ loadPrevInterval, prevVisits }) => {
    const screen = await setUp({
      visitsInfo: { visits, prevVisits },
      settings: {
        visits: fromPartial({
          loadPrevInterval,
        }),
      },
    });

    expect(getVisitsMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ loadPrevInterval }));
    expect(screen.getByTestId('line-chart-container').element()).toMatchSnapshot();
  });
});
