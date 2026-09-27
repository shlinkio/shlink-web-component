import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { TagsTable } from '../../src/tags/TagsTable';
import { rangeOf } from '../../src/utils/helpers';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagsTable />', () => {
  const orderByColumn = vi.fn();
  const tags = (amount: number) => rangeOf(amount, (i) => `tag_${i}`);
  const setUp = (sortedTags: string[] = [], search = '') =>
    renderWithStore(
      <MemoryRouter initialEntries={search ? [{ search }] : undefined}>
        <ContainerProvider value={fromPartial({ ColorGenerator: colorGeneratorMock, apiClientFactory: vi.fn() })}>
          <TagsTable
            sortedTags={sortedTags.map((tag) => fromPartial({ tag }))}
            currentOrder={{}}
            orderByColumn={() => orderByColumn}
          />
        </ContainerProvider>
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders empty result if there are no tags', async () => {
    const screen = await setUp();

    await Promise.all([
      expect.element(screen.getByText(/^TagsTableRow/)).not.toBeInTheDocument(),
      expect.element(screen.getByText('No tags found')).toBeInTheDocument(),
    ]);
  });

  it.each([
    [['foo', 'bar', 'baz'], 3],
    [['foo'], 1],
    [tags(19), 19],
    [tags(20), 20],
    [tags(30), 20],
    [tags(100), 20],
  ])('renders as many rows as there are in current page', async (filteredTags, expectedRows) => {
    const screen = await setUp(filteredTags);

    expect(screen.getByRole('row').all()).toHaveLength(expectedRows);
    await expect.element(screen.getByText('No results found')).not.toBeInTheDocument();
  });

  it.each([
    [['foo', 'bar', 'baz'], false],
    [['foo'], false],
    [tags(19), false],
    [tags(20), false],
    [tags(30), true],
    [tags(100), true],
  ])('renders paginator if there are more than one page', async (filteredTags, shouldRenderPaginator) => {
    const screen = await setUp(filteredTags);

    if (shouldRenderPaginator) {
      await expect.element(screen.getByTestId('tags-paginator')).toBeInTheDocument();
    } else {
      await expect.element(screen.getByTestId('tags-paginator')).not.toBeInTheDocument();
    }
  });

  it.each([
    [1, 20, 0],
    [2, 20, 20],
    [3, 20, 40],
    [4, 20, 60],
    [5, 7, 80],
    [6, 0, 0],
  ])('renders page from query if present', async (page, expectedRows, offset) => {
    const screen = await setUp(tags(87), `page=${page}`);

    const tagRows = screen.getByRole('row').all();

    expect(tagRows).toHaveLength(expectedRows || 1); // No results still render the fallback row
    if (expectedRows > 0) {
      await Promise.all(
        tagRows.map((row, index) => expect.element(row).toMatchTextContent(`tag_${index + offset + 1}`)),
      );
    }
  });

  it('allows changing current page in paginator', async () => {
    const { user, container, ...screen } = await setUp(tags(100));

    await expect.element(container.querySelector('[data-active="true"]') as HTMLElement).toHaveTextContent('1');
    await user.click(screen.getByText('5'));
    await expect.element(container.querySelector('[data-active="true"]') as HTMLElement).toHaveTextContent('5');
  });

  // FIXME This test does not work because of the browser resolution. The headers that are clicked are not visible
  it.skip('orders tags when column is clicked', async () => {
    const { user, ...screen } = await setUp(tags(100));
    const headers = screen.getByRole('columnheader', { includeHidden: true }).all();

    expect(orderByColumn).not.toHaveBeenCalled();
    await user.click(headers[0]);
    await user.click(headers[2]);
    await user.click(headers[1]);
    expect(orderByColumn).toHaveBeenCalledTimes(3);
  });
});
