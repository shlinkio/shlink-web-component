import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, parseISO } from 'date-fns';
import type { MemoryHistory } from 'history';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { DEFAULT_DOMAIN } from '../../src/domains/data';
import { SettingsProvider } from '../../src/settings';
import { ShortUrlsFilteringBarFactory } from '../../src/short-urls/ShortUrlsFilteringBar';
import { TagsSearchDropdownFactory } from '../../src/tags/helpers/TagsSearchDropdown';
import { FeaturesProvider } from '../../src/utils/features';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  search?: string;
  routesPrefix?: string;
  filterByDomainSupported?: boolean;
  filterByExcludedTagSupported?: boolean;
};

describe('<ShortUrlsFilteringBar />', () => {
  const ShortUrlsFilteringBar = ShortUrlsFilteringBarFactory(fromPartial({
    ExportShortUrlsBtn: () => <>ExportShortUrlsBtn</>,
    TagsSearchDropdown: TagsSearchDropdownFactory(fromPartial({ ColorGenerator: colorGeneratorMock })),
  }));
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
        <SettingsProvider value={fromPartial({ visits: {} })}>
          <RoutesPrefixProvider value={routesPrefix}>
            <FeaturesProvider
              value={fromPartial({
                filterShortUrlsByDomain: filterByDomainSupported,
                filterShortUrlsByExcludedTags: filterByExcludedTagSupported,
              })}
            >
              <ShortUrlsFilteringBar
                order={{}}
                handleOrderBy={handleOrderBy}
                domainsList={fromPartial({
                  domains: [
                    { isDefault: true, domain: 'example.com' },
                    { isDefault: false, domain: 's.test' },
                  ],
                })}
              />
            </FeaturesProvider>
          </RoutesPrefixProvider>
        </SettingsProvider>
      </Router>,
      {
        initialState: { tagsList: fromPartial({ tags: ['foo', 'bar', 'baz'] }) },
      },
    );
  };

  const currentPath = () => history.location.pathname;
  const currentQuery = () => history.location.search;
  const paramFromCurrentQuery = (param: string) => new URLSearchParams(currentQuery()).get(param);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected children components', () => {
    setUp();
    expect(screen.getByText('ExportShortUrlsBtn')).toBeInTheDocument();
  });

  it('redirects to first page when search field changes', async () => {
    const { user } = setUp({ routesPrefix: '/server/1' });

    expect(paramFromCurrentQuery('search')).toBeNull();
    await user.type(screen.getByPlaceholderText('Search...'), 'search-term');

    // Searching is deferred. Wait for query to be applied
    await waitFor(() => expect(paramFromCurrentQuery('search')).toEqual('search-term'));
    expect(currentPath()).toEqual('/server/1/list-short-urls/1');
  });

  const uriEncodedISODate = (date: string) => encodeURIComponent(formatISO(parseISO(date)));

  it.each([
    [
      (user: UserEvent) => user.type(screen.getByLabelText('Since:'), '2022-05-07'),
      `startDate=${uriEncodedISODate('2022-05-07')}`,
    ],
    [
      (user: UserEvent) => user.type(screen.getByLabelText('Until:'), '2023-12-18'),
      `endDate=${uriEncodedISODate('2023-12-18T23:59:59')}`,
    ],
  ])('redirects to first page when date range changes', async (typeDates, expectedQuery) => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'All short URLs' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    expect(currentQuery()).toEqual('');

    await typeDates(user);
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
    const { user } = setUp({ search });
    const toggleFilter = async (name: RegExp) => {
      await user.click(screen.getByRole('button', { name: /^More/ }));
      await waitFor(() => screen.findByRole('menu'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    await toggleFilter(menuItemName);
    expect(currentQuery()).toEqual(`?${expectedQuery}`);
  });

  it('handles order through dropdown', async () => {
    const { user } = setUp();
    const clickMenuItem = async (name: string | RegExp) => {
      await user.click(screen.getByRole('button', { name: 'Order by...' }));
      await user.click(await screen.findByRole('menuitem', { name }));
    };

    await clickMenuItem(/^Short URL/);
    expect(handleOrderBy).toHaveBeenCalledWith('shortCode', 'ASC');

    await clickMenuItem(/^Title/);
    expect(handleOrderBy).toHaveBeenCalledWith('title', 'ASC');

    await clickMenuItem(/^Long URL/);
    expect(handleOrderBy).toHaveBeenCalledWith('longUrl', 'ASC');
  });

  it.each([true, false])('shows domain dropdown if filtering by domain is supported', (filterByDomainSupported) => {
    setUp({ filterByDomainSupported });

    if (filterByDomainSupported) {
      expect(screen.getByRole('button', { name: 'All domains' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button', { name: 'All domains' })).not.toBeInTheDocument();
    }
  });

  it.each([
    { domain: /^example.com/, expectedQueryDomain: DEFAULT_DOMAIN },
    { domain: 's.test', expectedQueryDomain: 's.test' },
  ])('updates query params when selected domain changes', async ({ domain, expectedQueryDomain }) => {
    const { user } = setUp({ filterByDomainSupported: true });

    await user.click(screen.getByRole('button', { name: 'All domains' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: domain }));
    await waitFor(() => expect(paramFromCurrentQuery('domain')).toEqual(expectedQueryDomain));
  });

  it('updates query params when tags change', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'With tags...' }));
    const menu = await screen.findByRole('menu');

    await user.type(menu.querySelector('[placeholder="Search..."]')!, 'f');
    await user.click(await screen.findByRole('option', { name: 'foo' }));

    await waitFor(() => expect(paramFromCurrentQuery('tags')).toEqual('foo'));
  });

  it('updates query params when tags mode changes', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'With tags...' }));

    await user.click(await screen.findByRole('button', { name: 'Any' }));
    await waitFor(() => expect(paramFromCurrentQuery('tagsMode')).toEqual('any'));

    await user.click(await screen.findByRole('button', { name: 'All' }));
    await waitFor(() => expect(paramFromCurrentQuery('tagsMode')).toEqual('all'));
  });

  it.each([true, false])('shows exclude tags dropdown if supported', (filterByExcludedTagSupported) => {
    setUp({ filterByExcludedTagSupported });

    if (filterByExcludedTagSupported) {
      expect(screen.getByRole('button', { name: 'Without tags...' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button', { name: 'Without tags...' })).not.toBeInTheDocument();
    }
  });

  it('updates query params when excluded tags change', async () => {
    const { user } = setUp({ filterByExcludedTagSupported: true });

    await user.click(screen.getByRole('button', { name: 'Without tags...' }));
    const menu = await screen.findByRole('menu');

    await user.type(menu.querySelector('[placeholder="Search..."]')!, 'ba');
    await user.click(await screen.findByRole('option', { name: 'bar' }));

    await waitFor(() => expect(paramFromCurrentQuery('excludeTags')).toEqual('bar'));
  });

  it('updates query params when excluded tags mode changes', async () => {
    const { user } = setUp({ filterByExcludedTagSupported: true });

    await user.click(screen.getByRole('button', { name: 'Without tags...' }));

    await user.click(await screen.findByRole('button', { name: 'Any' }));
    await waitFor(() => expect(paramFromCurrentQuery('excludeTagsMode')).toEqual('any'));

    await user.click(await screen.findByRole('button', { name: 'All' }));
    await waitFor(() => expect(paramFromCurrentQuery('excludeTagsMode')).toEqual('all'));
  });
});
