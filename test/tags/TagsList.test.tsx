import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { SettingsProvider } from '../../src/settings';
import type { TagsList } from '../../src/tags/reducers/tagsList';
import { TagsList as TagsListComp } from '../../src/tags/TagsList';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagsList />', () => {
  const setUp = (tagsList: Partial<TagsList> = {}, excludeBots = false) =>
    renderWithStore(
      <MemoryRouter>
        <SettingsProvider value={fromPartial({ visits: { excludeBots } })}>
          <ContainerProvider value={fromPartial({ ColorGenerator: colorGeneratorMock, apiClientFactory: vi.fn() })}>
            <TagsListComp />
          </ContainerProvider>
        </SettingsProvider>
      </MemoryRouter>,
      {
        initialState: {
          tagsList: fromPartial({
            filteredTags: [],
            tags: ['foo', 'bar', 'baz'],
            stats: {
              foo: {
                visitsSummary: { total: 0 },
              },
              bar: {
                visitsSummary: { total: 0 },
              },
              baz: {
                visitsSummary: { total: 0 },
              },
            },
            ...tagsList,
          }),
        },
      },
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows a loading message when tags are being loaded', async () => {
    const screen = await setUp({ status: 'loading' });

    await Promise.all([
      expect.element(screen.getByText('Loading...')).toBeInTheDocument(),
      expect.element(screen.getByText('Error loading tags :(')).not.toBeInTheDocument(),
    ]);
  });

  it('shows an error when tags failed to be loaded', async () => {
    const screen = await setUp({ status: 'error' });

    await Promise.all([
      expect.element(screen.getByText('Error loading tags :(')).toBeInTheDocument(),
      expect.element(screen.getByText('Loading')).not.toBeInTheDocument(),
    ]);
  });

  it('filters tags when search field changes', async () => {
    const { user, store, ...screen } = await setUp();

    await user.type(screen.getByPlaceholder('Search...'), 'ba');
    await expect.poll(() => store.getState().tagsList.filteredTags).toEqual(['bar', 'baz']);
  });

  it.each([
    [
      false,
      {
        total: 20,
        nonBots: 15,
        bots: 5,
      },
      '20',
    ],
    [
      true,
      {
        total: 20,
        nonBots: 15,
        bots: 5,
      },
      '15',
    ],
  ])('displays proper amount of visits', async (excludeBots, visitsSummary, expectedAmount) => {
    const screen = await setUp(
      {
        filteredTags: ['foo', 'bar', 'baz'],
        stats: {
          foo: {
            visitsSummary,
            shortUrlsCount: 1,
          },
          bar: {
            visitsSummary,
            shortUrlsCount: 1,
          },
          baz: {
            visitsSummary,
            shortUrlsCount: 1,
          },
        },
      },
      excludeBots,
    );

    const amounts = screen.getByTestId('visits-amount').all();
    await Promise.all(amounts.map((amountEl) => expect.element(amountEl).toHaveTextContent(expectedAmount)));
  });
});
