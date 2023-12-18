import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import type { MemoryHistory } from 'history';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ShortUrlsFilteringBarFactory } from '../../src/short-urls/ShortUrlsFilteringBar';
import { formatIsoDate } from '../../src/utils/dates/helpers/date';
import type { DateRange } from '../../src/utils/dates/helpers/dateIntervals';
import { FeaturesProvider } from '../../src/utils/features';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { SettingsProvider } from '../../src/utils/settings';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<any>('react-router-dom')),
  useParams: vi.fn().mockReturnValue({ serverId: '1' }),
}));

describe('<ShortUrlsFilteringBar />', () => {
  const ShortUrlsFilteringBar = ShortUrlsFilteringBarFactory(fromPartial({
    ExportShortUrlsBtn: () => <>ExportShortUrlsBtn</>,
    TagsSelector: () => <>TagsSelector</>,
  }));
  const handleOrderBy = vi.fn();
  const now = new Date();
  let history: MemoryHistory;

  const setUp = (search: string | undefined = undefined, filterDisabledUrls = true) => {
    history = createMemoryHistory({ initialEntries: search ? [{ search }] : undefined });
    return renderWithEvents(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={fromPartial({ visits: {} })}>
          <FeaturesProvider value={fromPartial({ filterDisabledUrls })}>
            <RoutesPrefixProvider value="/server/1">
              <ShortUrlsFilteringBar order={{}} handleOrderBy={handleOrderBy} tagsList={fromPartial({ tags: [] })} />
            </RoutesPrefixProvider>
          </FeaturesProvider>
        </SettingsProvider>
      </Router>,
    );
  };

  const getPath = () => history.location.pathname;
  const getQuery = () => history.location.search;
  const getQueryParam = (param: string) => new URLSearchParams(getQuery()).get(param);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected children components', () => {
    setUp();

    expect(screen.getByText('ExportShortUrlsBtn')).toBeInTheDocument();
    expect(screen.getByText('TagsSelector')).toBeInTheDocument();
  });

  it('redirects to first page when search field changes', async () => {
    const { user } = setUp();

    expect(getQueryParam('search')).toBeNull();
    await user.type(screen.getByPlaceholderText('Search...'), 'search-term');

    // Searching is deferred. Wait for query to be applied
    await waitFor(() => expect(getQueryParam('search')).toEqual('search-term'));
    expect(getPath()).toEqual('/server/1/list-short-urls/1');
  });

  it.each([
    [{ startDate: now } as DateRange, `startDate=${encodeURIComponent(formatISO(startOfDay(now)))}`],
    [{ endDate: now } as DateRange, `endDate=${encodeURIComponent(formatISO(endOfDay(now)))}`],
    [
      { startDate: now, endDate: now } as DateRange,
      `startDate=${encodeURIComponent(formatISO(startOfDay(now)))}&endDate=${encodeURIComponent(formatISO(endOfDay(now)))}`,
    ],
  ])('redirects to first page when date range changes', async (dates, expectedQuery) => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'All short URLs' }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();

    expect(getQuery()).toEqual('');
    dates.startDate && await user.type(screen.getByPlaceholderText('Since...'), formatIsoDate(dates.startDate) ?? '');
    dates.endDate && await user.type(screen.getByPlaceholderText('Until...'), formatIsoDate(dates.endDate) ?? '');
    expect(getQuery()).toEqual(`?${expectedQuery}`);
    expect(getPath()).toEqual('/server/1/list-short-urls/1');
  });

  it.each([
    { search: 'tags=foo,bar,baz', shouldHaveComponent: true },
    { search: 'tags=foo,bar', shouldHaveComponent: true },
    { search: 'tags=foo', shouldHaveComponent: false },
    { search: '', shouldHaveComponent: false },
  ])(
    'renders tags mode toggle if there is more than one tag selected',
    ({ search, shouldHaveComponent }) => {
      setUp(search);

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
    const { user } = setUp(`tags=foo,bar${initialTagsMode}`, true);

    await user.hover(screen.getByLabelText('Change tags mode'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(expectedToggleText);
  });

  it.each([
    ['', 'all'],
    ['&tagsMode=all', 'any'],
    ['&tagsMode=any', 'all'],
  ])('redirects to first page when tags mode changes', async (initialTagsMode, expectedRedirectTagsMode) => {
    const { user } = setUp(`tags=foo,bar${initialTagsMode}`, true);

    await user.click(screen.getByLabelText('Change tags mode'));
    expect(getQueryParam('tagsMode')).toEqual(expectedRedirectTagsMode);
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
    const { user } = setUp(search, true);
    const toggleFilter = async (name: RegExp) => {
      await user.click(screen.getByRole('button', { name: 'Filters' }));
      await waitFor(() => screen.findByRole('menu'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    await toggleFilter(menuItemName);
    expect(getQuery()).toEqual(`?${expectedQuery}`);
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
