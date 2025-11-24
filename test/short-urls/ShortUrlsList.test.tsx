import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import type { ShlinkShortUrlsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen } from '@testing-library/react';
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
  loading?: boolean;
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
  const shortUrlsList = fromPartial<ShortUrlsListModel>({ shortUrls: shortUrlsApiResponse });
  const setUp = ({ settings = {}, loading = false }: SetUpOptions = {}) => {
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
          shortUrlsList: fromPartial({ ...shortUrlsList, loading }),
          mercureInfo: fromPartial({ loading: true }),
        },
        apiClientFactory,
      },
    );

    return { history, ...renderResult };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps expected components', () => {
    setUp();

    expect(screen.getByText('ShortUrlsTable')).toBeInTheDocument();
    expect(screen.getByText('ShortUrlsFilteringBar')).toBeInTheDocument();
  });

  it('gets list refreshed every time a tag is clicked', async () => {
    const { user, history } = setUp();
    const getTagsFromQuery = () => new URLSearchParams(history.location.search).get('tags');

    expect(getTagsFromQuery()).toEqual('test tag');
    await user.click(screen.getByTestId('add-tag-button'));
    expect(getTagsFromQuery()).toEqual('test tag,foo');
  });

  it.each([
    [fromPartial<ShortUrlsOrder>({ field: 'visits', dir: 'ASC' }), 'visits', 'ASC'],
    [fromPartial<ShortUrlsOrder>({ field: 'title', dir: 'DESC' }), 'title', 'DESC'],
    [fromPartial<ShortUrlsOrder>({}), undefined, undefined],
  ])('has expected initial ordering based on settings', (defaultOrdering, field, dir) => {
    setUp({
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
  ])('parses order by based on supported features version and config', (settings, expectedOrderBy) => {
    setUp({ settings });
    expect(listShortUrlsMock).toHaveBeenCalledWith(expect.objectContaining({ orderBy: expectedOrderBy }));
  });
});
