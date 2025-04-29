import { ELLIPSIS } from '@shlinkio/shlink-frontend-kit/tailwind';
import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkPaginator } from '../../src/api-contract';
import { Paginator } from '../../src/short-urls/Paginator';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<Paginator />', () => {
  const buildPaginator = (pagesCount?: number) => fromPartial<ShlinkPaginator>({ pagesCount, currentPage: 1 });
  const setUp = (paginator?: ShlinkPaginator, currentQueryString?: string) => render(
    <MemoryRouter>
      <Paginator paginator={paginator} currentQueryString={currentQueryString} />
    </MemoryRouter>,
  );

  it.each([
    [undefined],
    [buildPaginator()],
    [buildPaginator(0)],
    [buildPaginator(1)],
    [buildPaginator(2)],
    [buildPaginator(5)],
    [buildPaginator(25)],
  ])('passes a11y checks', (paginator) => checkAccessibility(setUp(paginator)));

  it.each([
    [undefined],
    [buildPaginator()],
    [buildPaginator(0)],
    [buildPaginator(1)],
  ])('renders an empty gap if the number of pages is below 2', (paginator) => {
    setUp(paginator);
    expect(screen.getByTestId('empty-gap')).toBeInTheDocument();
  });

  it.each([
    { paginator: buildPaginator(2), expectedPages: 3, expectedEllipsis: 0 },
    { paginator: buildPaginator(3), expectedPages: 4, expectedEllipsis: 0 },
    { paginator: buildPaginator(4), expectedPages: 5, expectedEllipsis: 0 },
    { paginator: buildPaginator(5), expectedPages: 5, expectedEllipsis: 1 },
    { paginator: buildPaginator(6), expectedPages: 5, expectedEllipsis: 1 },
    { paginator: buildPaginator(23), expectedPages: 5, expectedEllipsis: 1 },
  ])('renders previous, next and the list of pages, with ellipses when expected', ({
    paginator,
    expectedPages,
    expectedEllipsis,
  }) => {
    setUp(paginator);

    const links = screen.getAllByRole('link');
    const ellipsis = screen.queryAllByText(ELLIPSIS);

    expect(links).toHaveLength(expectedPages);
    expect(ellipsis).toHaveLength(expectedEllipsis);
  });

  it('appends query string to all pages', () => {
    const paginator = buildPaginator(3);
    const currentQueryString = '?foo=bar';

    setUp(paginator, currentQueryString);
    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(4);
    links.forEach((link) => expect(link).toHaveAttribute('href', expect.stringContaining(currentQueryString)));
  });
});
