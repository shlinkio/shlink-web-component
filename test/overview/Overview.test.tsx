import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import type { ShlinkVisitsOverview } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { Overview } from '../../src/overview/Overview';
import { SettingsProvider } from '../../src/settings';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

type SetUpOptions = {
  excludeBots?: boolean;
  loading?: boolean;
};

describe('<Overview />', () => {
  const shortUrls = {
    data: [],
    pagination: { totalItems: 83710 },
  };
  const visitsOverview = fromPartial<ShlinkVisitsOverview>({
    nonOrphanVisits: { total: 3456, bots: 1000, nonBots: 2456 },
    orphanVisits: { total: 28, bots: 15, nonBots: 13 },
  });

  const routesPrefix = '/server/123';
  const setUp = ({ excludeBots, loading }: SetUpOptions = {}) =>
    renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({ visits: { excludeBots } })}>
          <RoutesPrefixProvider value={routesPrefix}>
            <ContainerProvider
              value={fromPartial({
                useToggleTimeout: vi.fn(() => []),
                apiClientFactory: () =>
                  fromPartial<ShlinkApiClient>({
                    listShortUrls: vi.fn().mockResolvedValue(shortUrls),
                    getVisitsOverview: vi.fn().mockResolvedValue(visitsOverview),
                  }),
              })}
            >
              <Overview />
            </ContainerProvider>
          </RoutesPrefixProvider>
        </SettingsProvider>
      </MemoryRouter>,
      {
        initialState: {
          tagsList: fromPartial(loading ? { status: 'loading' } : { status: 'idle', tags: ['foo', 'bar', 'baz'] }),
        },
      },
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('displays loading messages when still loading', async () => {
    const screen = await setUp({ loading: true });
    expect(screen.getByText('Loading...').all().length).toBeGreaterThan(0);
  });

  it.each([
    [false, 3456, 28],
    [true, 2456, 13],
  ])('displays amounts in cards after finishing loading', async (excludeBots, expectedVisits, expectedOrphanVisits) => {
    const screen = await setUp({ excludeBots });

    const headingElements = screen.getByRole('link').all();

    await expect.element(headingElements[0]).toHaveTextContent(`Visits${formatNumber(expectedVisits)}`);
    await expect.element(headingElements[1]).toHaveTextContent(`Orphan visits${formatNumber(expectedOrphanVisits)}`);
    await expect.element(headingElements[2]).toHaveTextContent(`Short URLs${formatNumber(83710)}`);
    await expect.element(headingElements[3]).toHaveTextContent(`Tags${formatNumber(3)}`);
  });

  it('displays links to other sections', async () => {
    const screen = await setUp();
    const links = screen.getByRole('link').all();

    expect(links).toHaveLength(6);
    await expect.element(links[0]).toHaveAttribute('href', `${routesPrefix}/non-orphan-visits`);
    await expect.element(links[1]).toHaveAttribute('href', `${routesPrefix}/orphan-visits`);
    await expect.element(links[2]).toHaveAttribute('href', `${routesPrefix}/list-short-urls/1`);
    await expect.element(links[3]).toHaveAttribute('href', `${routesPrefix}/manage-tags`);
    await expect.element(links[4]).toHaveAttribute('href', `${routesPrefix}/create-short-url`);
    await expect.element(links[5]).toHaveAttribute('href', `${routesPrefix}/list-short-urls/1`);
  });
});
