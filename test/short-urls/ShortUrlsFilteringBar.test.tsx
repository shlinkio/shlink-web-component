import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { formatISO, parseISO } from 'date-fns';
import type { MemoryHistory } from 'history';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { SettingsProvider } from '../../src/settings';
import { ShortUrlsFilteringBarFactory } from '../../src/short-urls/ShortUrlsFilteringBar';
import { FeaturesProvider } from '../../src/utils/features';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = {
  search?: string;
  routesPrefix?: string;
};

describe('<ShortUrlsFilteringBar />', () => {
  const ShortUrlsFilteringBar = ShortUrlsFilteringBarFactory(fromPartial({
    ExportShortUrlsBtn: () => <>ExportShortUrlsBtn</>,
    TagsSelector: () => <>TagsSelector</>,
  }));
  const handleOrderBy = vi.fn();
  let history: MemoryHistory;

  const setUp = ({ search, routesPrefix = '' }: SetUpOptions = {}) => {
    history = createMemoryHistory({ initialEntries: search ? [{ search }] : undefined });
    return renderWithEvents(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={fromPartial({ visits: {} })}>
          <FeaturesProvider value={fromPartial({ filterDisabledUrls: true })}>
            <RoutesPrefixProvider value={routesPrefix}>
              <ShortUrlsFilteringBar
                order={{}}
                handleOrderBy={handleOrderBy}
                tagsList={fromPartial({ tags: [] })}
                domainsList={fromPartial({})}
              />
            </RoutesPrefixProvider>
          </FeaturesProvider>
        </SettingsProvider>
      </Router>,
    );
  };

  const currentPath = () => history.location.pathname;
  const currentQuery = () => history.location.search;
  const paramFromCurrentQuery = (param: string) => new URLSearchParams(currentQuery()).get(param);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected children components', () => {
    setUp();

    expect(screen.getByText('ExportShortUrlsBtn')).toBeInTheDocument();
    expect(screen.getByText('TagsSelector')).toBeInTheDocument();
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
    { search: 'tags=foo,bar,baz', shouldHaveComponent: true },
    { search: 'tags=foo,bar', shouldHaveComponent: true },
    { search: 'tags=foo', shouldHaveComponent: false },
    { search: '', shouldHaveComponent: false },
  ])(
    'renders tags mode toggle if there is more than one tag selected',
    ({ search, shouldHaveComponent }) => {
      setUp({ search });

      if (shouldHaveComponent) {
        expect(screen.getByLabelText('Change tags mode')).toBeInTheDocument();
      } else {
        expect(screen.queryByLabelText('Change tags mode')).not.toBeInTheDocument();
      }
    },
  );

  it.each([
    ['', 'With any of the tags.'],
    ['&tagsMode=all', 'With all the tags.'],
    ['&tagsMode=any', 'With any of the tags.'],
  ])('expected tags mode tooltip title', async (initialTagsMode, expectedToggleText) => {
    const { user } = setUp({ search: `tags=foo,bar${initialTagsMode}` });

    await user.hover(screen.getByLabelText('Change tags mode'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(expectedToggleText);
  });

  it.each([
    ['', 'all'],
    ['&tagsMode=all', 'any'],
    ['&tagsMode=any', 'all'],
  ])('redirects to first page when tags mode changes', async (initialTagsMode, expectedRedirectTagsMode) => {
    const { user } = setUp({ search: `tags=foo,bar${initialTagsMode}` });

    await user.click(screen.getByLabelText('Change tags mode'));
    expect(paramFromCurrentQuery('tagsMode')).toEqual(expectedRedirectTagsMode);
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
  ])('allows to toggle filters through filtering dropdown', async (search, menuItemName, expectedQuery) => {
    const { user } = setUp({ search });
    const toggleFilter = async (name: RegExp) => {
      await user.click(screen.getByRole('button', { name: 'Filters' }));
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
});
