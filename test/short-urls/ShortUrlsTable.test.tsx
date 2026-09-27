import { fromPartial } from '@total-typescript/shoehorn';
import type { ShortUrlsOrderableFields } from '../../src/short-urls/data';
import { SHORT_URLS_ORDERABLE_FIELDS } from '../../src/short-urls/data';
import type { ShortUrlsList } from '../../src/short-urls/reducers/shortUrlsList';
import { ShortUrlsTable } from '../../src/short-urls/ShortUrlsTable';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/setUpTest';

describe('<ShortUrlsTable />', () => {
  const shortUrlsList = fromPartial<ShortUrlsList>({});
  const orderByColumn = vi.fn();
  const setUp = () => render(<ShortUrlsTable shortUrlsList={shortUrlsList} orderByColumn={() => orderByColumn} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('should render inner table by default', async () => {
    const screen = await setUp();
    await expect.element(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render row groups by default', async () => {
    const screen = await setUp();
    expect(screen.getByRole('rowgroup').all()).toHaveLength(1);
  });

  it('should render expected amount of table header cells', async () => {
    const screen = await setUp();
    expect(screen.getByRole('columnheader', { includeHidden: true }).all()).toHaveLength(6);
  });

  it('should render table header cells without "order by" icon by default', async () => {
    const screen = await setUp();
    await expect.element(screen.getByRole('img', { includeHidden: true })).not.toBeInTheDocument();
  });

  it('should render table header cells with conditional order by icon', async () => {
    const screen = await setUp();

    const getThElementForSortableField = (orderableField: string) =>
      screen
        .getByRole('columnheader', { includeHidden: true })
        .elements()
        .find(({ innerHTML }) =>
          innerHTML.includes(SHORT_URLS_ORDERABLE_FIELDS[orderableField as ShortUrlsOrderableFields]),
        );
    const sortableFields = Object.keys(SHORT_URLS_ORDERABLE_FIELDS).filter(
      (sortableField) => sortableField !== 'title',
    );

    expect.assertions(sortableFields.length * 2);
    sortableFields.forEach((sortableField) => {
      const element = getThElementForSortableField(sortableField);

      expect(element).toBeDefined();
      element?.dispatchEvent(new Event('click', { bubbles: true }));
      expect(orderByColumn).toHaveBeenCalled();
    });
  });

  it('should render composed title column', async () => {
    const screen = await setUp();

    const { innerHTML } = screen.getByRole('columnheader', { includeHidden: true }).elements()[2];

    expect(innerHTML).toContain('Title');
    expect(innerHTML).toContain('Long URL');
  });
});
