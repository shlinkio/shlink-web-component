import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { MemoryHistory } from 'history';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import type { MercureBoundProps } from '../../src/mercure/helpers/boundToMercureHub';
import type { Settings } from '../../src/settings';
import { SettingsProvider } from '../../src/settings';
import type { ShortUrlsOrder } from '../../src/short-urls/data';
import type { ShortUrlsList as ShortUrlsListModel } from '../../src/short-urls/reducers/shortUrlsList';
import { ShortUrlsListFactory } from '../../src/short-urls/ShortUrlsList';
import type { ShortUrlsTableType } from '../../src/short-urls/ShortUrlsTable';
import { FeaturesProvider } from '../../src/utils/features';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

type SetUpOptions = {
  settings?: Partial<Settings>;
  excludeBotsOnShortUrls?: boolean;
  loading?: boolean;
};

describe('<ShortUrlsList />', () => {
  const ShortUrlsTable: ShortUrlsTableType = ({ onTagClick }) => (
    <button type="button" onClick={() => onTagClick?.('foo')} data-testid="add-tag-button">
      ShortUrlsTable
    </button>
  );
  const ShortUrlsFilteringBar = () => <span>ShortUrlsFilteringBar</span>;
  const listShortUrlsMock = vi.fn();
  const shortUrlsList = fromPartial<ShortUrlsListModel>({
    shortUrls: {
      data: [
        {
          shortCode: 'testShortCode',
          shortUrl: 'https://www.example.com/testShortUrl',
          longUrl: 'https://www.example.com/testLongUrl',
          tags: ['test tag'],
        },
      ],
      pagination: { pagesCount: 3 },
    },
  });
  let history: MemoryHistory;
  const ShortUrlsList = ShortUrlsListFactory(fromPartial({ ShortUrlsTable, ShortUrlsFilteringBar }));
  const setUp = ({ settings = {}, excludeBotsOnShortUrls = true, loading = false }: SetUpOptions = {}) => {
    history = createMemoryHistory();
    history.push({ search: '?tags=test%20tag&search=example.com' });

    return renderWithEvents(
      <Router location={history.location} navigator={history}>
        <SettingsProvider value={fromPartial(settings)}>
          <FeaturesProvider value={fromPartial({ excludeBotsOnShortUrls })}>
            <ShortUrlsList
              {...fromPartial<MercureBoundProps>({ mercureInfo: { loading: true } })}
              listShortUrls={listShortUrlsMock}
              shortUrlsList={{ ...shortUrlsList, loading }}
            />
          </FeaturesProvider>
        </SettingsProvider>
      </Router>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps expected components', () => {
    setUp();

    expect(screen.getByText('ShortUrlsTable')).toBeInTheDocument();
    expect(screen.getByText('ShortUrlsFilteringBar')).toBeInTheDocument();
  });

  it('passes current query to paginator', () => {
    setUp();

    const links = screen.getAllByRole('link');

    expect(links.length > 0).toEqual(true);
    links.forEach(
      (link) => expect(link).toHaveAttribute('href', expect.stringContaining('?tags=test%20tag&search=example.com')),
    );
  });

  it.each([[true], [false]])('hides paginator while loading', (loading) => {
    setUp({ loading });

    if (loading) {
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    } else {
      expect(screen.getByRole('list')).toBeInTheDocument();
    }
  });

  it('gets list refreshed every time a tag is clicked', async () => {
    const { user } = setUp();
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
    }), false, { field: 'visits', dir: 'ASC' }],
    [fromPartial<Settings>({
      shortUrlsList: {
        defaultOrdering: { field: 'visits', dir: 'ASC' },
      },
      visits: { excludeBots: true },
    }), false, { field: 'visits', dir: 'ASC' }],
    [fromPartial<Settings>({
      shortUrlsList: {
        defaultOrdering: { field: 'visits', dir: 'ASC' },
      },
    }), true, { field: 'visits', dir: 'ASC' }],
    [fromPartial<Settings>({
      shortUrlsList: {
        defaultOrdering: { field: 'visits', dir: 'ASC' },
      },
      visits: { excludeBots: true },
    }), true, { field: 'nonBotVisits', dir: 'ASC' }],
  ])('parses order by based on supported features version and config', (settings, excludeBotsOnShortUrls, expectedOrderBy) => {
    setUp({ settings, excludeBotsOnShortUrls });
    expect(listShortUrlsMock).toHaveBeenCalledWith(expect.objectContaining({ orderBy: expectedOrderBy }));
  });
});
