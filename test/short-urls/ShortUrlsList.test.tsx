import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import type { ShlinkShortUrlsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import type { Settings } from '../../src/settings';
import { SettingsProvider } from '../../src/settings';
import type { ShortUrlsOrder } from '../../src/short-urls/data';
import type { ShortUrlsList as ShortUrlsListModel } from '../../src/short-urls/reducers/shortUrlsList';
import { ShortUrlsList } from '../../src/short-urls/ShortUrlsList';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  settings?: Partial<Settings>;
};

describe('<ShortUrlsList />', () => {
  const shortUrlsApiResponse = fromPartial<ShlinkShortUrlsList>({
    data: [
      {
        shortCode: 'testShortCode',
        shortUrl: 'https://www.example.com/testShortUrl',
        longUrl: 'https://www.example.com/testLongUrl',
        tags: ['test tag', 'foo-tag'],
        visitsSummary: {},
        meta: {},
        dateCreated: '2025-01-01T10:00:00+00:00',
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
          <ContainerProvider
            value={fromPartial({
              useTimeoutToggle: vi.fn().mockReturnValue([]),
              ColorGenerator: colorGeneratorMock,
              apiClientFactory,
            })}
          >
            <ShortUrlsList />
          </ContainerProvider>
        </SettingsProvider>
      </Router>,
      {
        initialState: {
          shortUrlsList: fromPartial<ShortUrlsListModel>({ shortUrls: shortUrlsApiResponse }),
          mercureInfo: fromPartial({ status: 'loading' }),
        },
      },
    );

    // Wait for loading to finish, when the paginator will show
    await waitFor(() => expect(screen.getByTestId('short-urls-paginator')).toBeInTheDocument());

    return { history, ...renderResult };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('passes current query to paginator', async () => {
    await setUp();

    const paginatorLinks = screen.getByTestId('paginator').querySelectorAll('a');

    expect(paginatorLinks.length).toBeGreaterThan(0);
    paginatorLinks.forEach(
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
    await user.click(screen.getByRole('button', { name: 'foo-tag' }));
    expect(getTagsFromQuery()).toEqual('test tag,foo-tag');
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
