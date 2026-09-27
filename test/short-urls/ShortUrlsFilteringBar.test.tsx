import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, parseISO } from 'date-fns';
import type { MemoryHistory } from 'history';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { DEFAULT_DOMAIN } from '../../src/domains/data';
import { SettingsProvider } from '../../src/settings';
import { ShortUrlsFilteringBar } from '../../src/short-urls/ShortUrlsFilteringBar';
import { FeaturesProvider } from '../../src/utils/features';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { checkAccessibility } from '../__helpers__/accessibility';
import { setNativeInputValue } from '../__helpers__/input';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  search?: string;
  routesPrefix?: string;
  filterByDomainSupported?: boolean;
  filterByExcludedTagSupported?: boolean;
};

describe('<ShortUrlsFilteringBar />', () => {
  const handleOrderBy = vi.fn();
  let history: MemoryHistory;

  const setUp = ({
    search,
    routesPrefix = '',
    filterByDomainSupported = false,
    filterByExcludedTagSupported = false,
  }: SetUpOptions = {}) => {
    history = createMemoryHistory({ initialEntries: search ? [{ search }] : undefined });
    return renderWithStore(
      <Router location={history.location} navigator={history}>
        <ContainerProvider value={fromPartial({ ColorGenerator: colorGeneratorMock, apiClientFactory: vi.fn() })}>
          <SettingsProvider value={fromPartial({ visits: {} })}>
            <RoutesPrefixProvider value={routesPrefix}>
              <FeaturesProvider
                value={fromPartial({
                  filterShortUrlsByDomain: filterByDomainSupported,
                  filterShortUrlsByExcludedTags: filterByExcludedTagSupported,
                })}
              >
                <ShortUrlsFilteringBar order={{}} handleOrderBy={handleOrderBy} />
              </FeaturesProvider>
            </RoutesPrefixProvider>
          </SettingsProvider>
        </ContainerProvider>
      </Router>,
      {
        initialState: {
          tagsList: fromPartial({ tags: ['foo', 'bar', 'baz'] }),
          domainsList: fromPartial({
            domains: [
              { isDefault: true, domain: 'example.com' },
              { isDefault: false, domain: 's.test' },
            ],
          }),
        },
      },
    );
  };

  const currentPath = () => history.location.pathname;
  const currentQuery = () => history.location.search;
  const paramFromCurrentQuery = (param: string) => new URLSearchParams(currentQuery()).get(param);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected children components', async () => {
    const screen = await setUp();
    await expect.element(screen.getByRole('button', { name: /^Export/ })).toBeInTheDocument();
  });

  it('redirects to first page when search field changes', async () => {
    const { user, ...screen } = await setUp({ routesPrefix: '/server/1' });

    expect(paramFromCurrentQuery('search')).toBeNull();
    await user.type(screen.getByPlaceholder('Search...'), 'search-term');

    // Searching is deferred. Wait for query to be applied
    await expect.poll(() => paramFromCurrentQuery('search')).toEqual('search-term');
    expect(currentPath()).toEqual('/server/1/list-short-urls/1');
  });

  const uriEncodedISODate = (date: string) => encodeURIComponent(formatISO(parseISO(date)));

  it.each([
    [
      (screen: RenderWithEventsResult) =>
        setNativeInputValue(screen.getByLabelText('Since:').element() as HTMLInputElement, '2022-05-07'),
      `startDate=${uriEncodedISODate('2022-05-07')}`,
    ],
    [
      (screen: RenderWithEventsResult) =>
        setNativeInputValue(screen.getByLabelText('Until:').element() as HTMLInputElement, '2023-12-18'),
      `endDate=${uriEncodedISODate('2023-12-18T23:59:59')}`,
    ],
  ])('redirects to first page when date range changes', async (typeDates, expectedQuery) => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'All short URLs' }));
    await expect.element(screen.getByRole('menu')).toBeInTheDocument();

    expect(currentQuery()).toEqual('');

    typeDates({ user, ...screen });
    expect(currentPath()).toEqual('/list-short-urls/1');
    expect(currentQuery()).toEqual(`?${expectedQuery}`);
  });

  it.each([
    ['', /Ignore visits from bots/, 'excludeBots=true'],
    ['excludeBots=false', /Ignore visits from bots/, 'excludeBots=true'],
    ['excludeBots=true', /Ignore visits from bots/, 'excludeBots=false'],
    ['', /Exclude with visits reached/, 'excludeMaxVisitsReached=true'],
    ['excludeMaxVisitsReached=false', /Exclude with visits reached/, 'excludeMaxVisitsReached=true'],
    ['excludeMaxVisitsReached=true', /Exclude with visits reached/, 'excludeMaxVisitsReached=false'],
    ['', /Exclude enabled in the past/, 'excludePastValidUntil=true'],
    ['excludePastValidUntil=false', /Exclude enabled in the past/, 'excludePastValidUntil=true'],
    ['excludePastValidUntil=true', /Exclude enabled in the past/, 'excludePastValidUntil=false'],
  ])('allows to toggle filters through "More" dropdown', async (search, menuItemName, expectedQuery) => {
    const { user, ...screen } = await setUp({ search });
    const toggleFilter = async (name: RegExp) => {
      await user.click(screen.getByRole('button', { name: /^More/ }));
      // Wait for menu to be fully displayed
      await screen.getByRole('menu').findElement();
      await user.click(screen.getByRole('menuitem', { name }));
    };

    await toggleFilter(menuItemName);
    expect(currentQuery()).toEqual(`?${expectedQuery}`);
  });

  it('handles order through dropdown', async () => {
    const { user, ...screen } = await setUp();
    const clickMenuItem = async (name: string | RegExp) => {
      await user.click(screen.getByRole('button', { name: 'Order by...' }));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    await clickMenuItem(/^Short URL/);
    expect(handleOrderBy).toHaveBeenCalledWith('shortCode', 'ASC');

    await clickMenuItem(/^Title/);
    expect(handleOrderBy).toHaveBeenCalledWith('title', 'ASC');

    await clickMenuItem(/^Long URL/);
    expect(handleOrderBy).toHaveBeenCalledWith('longUrl', 'ASC');
  });

  it.each([true, false])(
    'shows domain dropdown if filtering by domain is supported',
    async (filterByDomainSupported) => {
      const screen = await setUp({ filterByDomainSupported });

      if (filterByDomainSupported) {
        await expect.element(screen.getByRole('button', { name: 'All domains' })).toBeInTheDocument();
      } else {
        await expect.element(screen.getByRole('button', { name: 'All domains' })).not.toBeInTheDocument();
      }
    },
  );

  it.each([
    { domain: /^example.com/, expectedQueryDomain: DEFAULT_DOMAIN },
    { domain: 's.test', expectedQueryDomain: 's.test' },
  ])('updates query params when selected domain changes', async ({ domain, expectedQueryDomain }) => {
    const { user, ...screen } = await setUp({ filterByDomainSupported: true });

    await user.click(screen.getByRole('button', { name: 'All domains' }));
    await expect.element(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: domain }));
    await expect.poll(() => paramFromCurrentQuery('domain')).toEqual(expectedQueryDomain);
  });

  it('updates query params when tags change', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'With tags...' }));
    const menu = await screen.getByRole('menu').findElement();

    await user.type(menu.querySelector('[placeholder="Search..."]')!, 'f');
    await user.click(screen.getByRole('option', { name: 'foo' }));

    await expect.poll(() => paramFromCurrentQuery('tags')).toEqual('foo');
  });

  it('updates query params when tags mode changes', async () => {
    const { user, ...screen } = await setUp();

    await user.click(screen.getByRole('button', { name: 'With tags...' }));

    await user.click(screen.getByRole('button', { name: 'Any' }));
    await expect.poll(() => paramFromCurrentQuery('tagsMode')).toEqual('any');

    await user.click(screen.getByRole('button', { name: 'All' }));
    await expect.poll(() => paramFromCurrentQuery('tagsMode')).toEqual('all');
  });

  it.each([true, false])('shows exclude tags dropdown if supported', async (filterByExcludedTagSupported) => {
    const screen = await setUp({ filterByExcludedTagSupported });

    if (filterByExcludedTagSupported) {
      await expect.element(screen.getByRole('button', { name: 'Without tags...' })).toBeInTheDocument();
    } else {
      await expect.element(screen.getByRole('button', { name: 'Without tags...' })).not.toBeInTheDocument();
    }
  });

  it('updates query params when excluded tags change', async () => {
    const { user, ...screen } = await setUp({ filterByExcludedTagSupported: true });

    await user.click(screen.getByRole('button', { name: 'Without tags...' }));
    const menu = await screen.getByRole('menu').findElement();

    await user.type(menu.querySelector('[placeholder="Search..."]')!, 'ba');
    await user.click(screen.getByRole('option', { name: 'bar' }));

    await expect.poll(() => paramFromCurrentQuery('excludeTags')).toEqual('bar');
  });

  it('updates query params when excluded tags mode changes', async () => {
    const { user, ...screen } = await setUp({ filterByExcludedTagSupported: true });

    await user.click(screen.getByRole('button', { name: 'Without tags...' }));

    await user.click(screen.getByRole('button', { name: 'Any' }));
    await expect.poll(() => paramFromCurrentQuery('excludeTagsMode')).toEqual('any');

    await user.click(screen.getByRole('button', { name: 'All' }));
    await expect.poll(() => paramFromCurrentQuery('excludeTagsMode')).toEqual('all');
  });
});
