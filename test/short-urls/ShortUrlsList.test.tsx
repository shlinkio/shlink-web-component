import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import type { ShlinkShortUrlsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import type { Settings } from '../../src/settings';
import { SettingsProvider } from '../../src/settings';
import type { ShortUrlsOrder } from '../../src/short-urls/data';
import type { ShortUrlsList as ShortUrlsListModel } from '../../src/short-urls/reducers/shortUrlsList';
import { ShortUrlsListFactory } from '../../src/short-urls/ShortUrlsList';
import type { ShortUrlsTableType } from '../../src/short-urls/ShortUrlsTable';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

type SetUpOptions = {
  settings?: Partial<Settings>;
};

describe('<ShortUrlsList />', () => {
  const ShortUrlsTable: ShortUrlsTableType = ({ onTagClick }) => (
    <button type="button" onClick={() => onTagClick?.('foo')} data-testid="add-tag-button">
      ShortUrlsTable
    </button>
  );
  const ShortUrlsFilteringBar = () => <span>ShortUrlsFilteringBar</span>;
  const ShortUrlsList = ShortUrlsListFactory(fromPartial({ ShortUrlsTable, ShortUrlsFilteringBar }));
  const shortUrlsApiResponse = fromPartial<ShlinkShortUrlsList>({
    data: [
      {
        shortCode: 'testShortCode',
        shortUrl: 'https://www.example.com/testShortUrl',
        longUrl: 'https://www.example.com/testLongUrl',
        tags: ['test tag'],
      },
    ],
    pagination: { pagesCount: 3 },
  });
  const listShortUrlsMock = vi.fn().mockResolvedValue(shortUrlsApiResponse);
  const apiClientFactory = vi.fn().mockReturnValue(fromPartial<ShlinkApiClient>({ listShortUrls: listShortUrlsMock }));
  const setUp = async ({ settings = {} }: SetUpOptions = {}) => {
    const history = createMemoryHistory();
    history.push({ search: '?tags=test%20tag&search=example.com' });

    const renderResult = renderWithStore(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={fromPartial(settings)}>
          <ShortUrlsList />
        </SettingsProvider>
      </Router>,
      {
        initialState: {
          shortUrlsList: fromPartial<ShortUrlsListModel>({ shortUrls: shortUrlsApiResponse }),
          mercureInfo: fromPartial({ loading: true }),
        },
        apiClientFactory,
      },
    );

    // Wait for loading to finish, when the paginator will show
    await waitFor(() => expect(screen.getByTestId('short-urls-paginator')).toBeInTheDocument());

    return { history, ...renderResult };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps expected components', async () => {
    await setUp();

    expect(screen.getByText('ShortUrlsTable')).toBeInTheDocument();
    expect(screen.getByText('ShortUrlsFilteringBar')).toBeInTheDocument();
  });

  it('passes current query to paginator', async () => {
    await setUp();

    const links = screen.getAllByRole('link');

    expect(links.length > 0).toEqual(true);
    links.forEach(
      (link) => expect(link).toHaveAttribute('href', expect.stringContaining('?tags=test%20tag&search=example.com')),
    );
  });

  it('hides paginator while loading', async () => {
    const setUpPromise = setUp();

    expect(screen.queryByTestId('short-urls-paginator')).not.toBeInTheDocument();
    await setUpPromise;
    expect(screen.getByTestId('short-urls-paginator')).toBeInTheDocument();
  });

  it('gets list refreshed every time a tag is clicked', async () => {
    const { user, history } = await setUp();
    const getTagsFromQuery = () => new URLSearchParams(history.location.search).get('tags');

    expect(getTagsFromQuery()).toEqual('test tag');
    await user.click(screen.getByTestId('add-tag-button'));
    expect(getTagsFromQuery()).toEqual('test tag,foo');
  });

  it.each([
    [fromPartial<ShortUrlsOrder>({ field: 'visits', dir: 'ASC' }), 'visits', 'ASC'],
    [fromPartial<ShortUrlsOrder>({ field: 'title', dir: 'DESC' }), 'title', 'DESC'],
    [fromPartial<ShortUrlsOrder>({}), undefined, undefined],
  ])('has expected initial ordering based on settings', async (defaultOrdering, field, dir) => {
    await setUp({
      settings: { shortUrlsList: { defaultOrdering } },
    });
    expect(listShortUrlsMock).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: { field, dir },
    }));
  });

  it.each([
    [fromPartial<Settings>({
      shortUrlsList: {
        defaultOrdering: { field: 'visits', dir: 'ASC' },
      },
    }), { field: 'visits', dir: 'ASC' }],
    [fromPartial<Settings>({
      shortUrlsList: {
        defaultOrdering: { field: 'visits', dir: 'ASC' },
      },
      visits: { excludeBots: true },
    }), { field: 'nonBotVisits', dir: 'ASC' }],
  ])('parses order by based on supported features version and config', async (settings, expectedOrderBy) => {
    await setUp({ settings });
    expect(listShortUrlsMock).toHaveBeenCalledWith(expect.objectContaining({ orderBy: expectedOrderBy }));
  });
});
