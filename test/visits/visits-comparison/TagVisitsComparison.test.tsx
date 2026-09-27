import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { TagVisitsComparison } from '../../../src/visits/visits-comparison/TagVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { cleanup, renderWithStore } from '../../__helpers__/setUpTest';
import { colorGeneratorMock, getColorForKey } from '../../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisitsComparison />', () => {
  const getTagVisits = vi.fn().mockResolvedValue(
    fromPartial<ShlinkVisitsList>({
      data: [],
      pagination: { currentPage: 1, pagesCount: 1, totalItems: 0 },
    }),
  );
  const setUp = (tags = ['foo', 'bar', 'baz']) =>
    renderWithStore(
      <MemoryRouter initialEntries={[{ search: `?tags=${tags.join(',')}` }]}>
        <TagVisitsComparison ColorGenerator={colorGeneratorMock} />
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({ getTagVisits }),
      },
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([[['foo']], [['foo', 'bar']], [['baz', 'something', 'whatever']]])('loads tags on mount', async (tags) => {
    await setUp(tags);
    expect(getTagVisits).toHaveBeenCalledTimes(tags.length);
  });

  it('cancels loading visits when unmounted', async () => {
    const { store } = await setUp();
    const isCanceled = () => store.getState().tagVisitsComparison.status === 'canceled';

    expect(isCanceled()).toBe(false);
    await cleanup();
    expect(isCanceled()).toBe(true);
  });

  it.each([[['foo']], [['foo', 'bar']], [['baz', 'something', 'whatever']]])('renders tags in title', async (tags) => {
    const screen = await setUp(tags);
    await Promise.all(tags.map((tag) => expect.element(screen.getByText(tag)).toBeInTheDocument()));
  });

  it('loads colors for tags', async () => {
    await setUp();

    await expect.poll(() => getColorForKey).toHaveBeenCalledTimes(3);
    expect(getColorForKey).toHaveBeenNthCalledWith(1, 'foo');
    expect(getColorForKey).toHaveBeenNthCalledWith(2, 'bar');
    expect(getColorForKey).toHaveBeenNthCalledWith(3, 'baz');
  });
});
