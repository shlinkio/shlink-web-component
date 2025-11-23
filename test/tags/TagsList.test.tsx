import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { ContainerProvider } from '../../src/container/context';
import { SettingsProvider } from '../../src/settings';
import type { TagsList } from '../../src/tags/reducers/tagsList';
import type { TagsListProps } from '../../src/tags/TagsList';
import { TagsListFactory } from '../../src/tags/TagsList';
import type { TagsTableProps } from '../../src/tags/TagsTable';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<TagsList />', () => {
  const filterTags = vi.fn();
  const TagsListComp = TagsListFactory(fromPartial({
    TagsTable: ({ sortedTags }: TagsTableProps) => <>TagsTable ({sortedTags.map((t) => t.visits).join(',')})</>,
  }));
  const setUp = (tagsList: Partial<TagsList> = {}, excludeBots = false) => renderWithStore(
    <ContainerProvider value={fromPartial({ apiClientFactory: vi.fn() })}>
      <SettingsProvider value={fromPartial({ visits: { excludeBots } })}>
        <TagsListComp
          {...fromPartial<TagsListProps>({})}
          filterTags={filterTags}
          tagsList={fromPartial({ filteredTags: [], ...tagsList })}
        />
      </SettingsProvider>
    </ContainerProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows a loading message when tags are being loaded', () => {
    setUp({ loading: true });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Error loading tags :(')).not.toBeInTheDocument();
  });

  it('shows an error when tags failed to be loaded', () => {
    setUp({ error: true });

    expect(screen.getByText('Error loading tags :(')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('triggers tags filtering when search field changes', async () => {
    const { user } = setUp();

    expect(filterTags).not.toHaveBeenCalled();
    await user.type(screen.getByPlaceholderText('Search...'), 'Hello');
    await waitFor(() => expect(filterTags).toHaveBeenCalledOnce());
  });

  it.each([
    [
      false,
      {
        total: 20,
        nonBots: 15,
        bots: 5,
      },
      '20,20,20',
    ],
    [
      true,
      {
        total: 20,
        nonBots: 15,
        bots: 5,
      },
      '15,15,15',
    ],
  ])('displays proper amount of visits', (excludeBots, visitsSummary, expectedAmounts) => {
    setUp({
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
    }, excludeBots);
    expect(screen.getByText(`TagsTable (${expectedAmounts})`)).toBeInTheDocument();
  });
});
