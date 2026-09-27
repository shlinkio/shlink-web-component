import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { TagsTableRow } from '../../src/tags/TagsTableRow';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import type { VisitsComparison } from '../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../__helpers__/setUpTest';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  visits?: number;
  shortUrls?: number;
  visitsComparison?: Partial<VisitsComparison>;
};

describe('<TagsTableRow />', () => {
  const tag = 'foo&bar';
  const setUp = ({ visits = 0, shortUrls = 0, visitsComparison }: SetUpOptions = {}) =>
    renderWithStore(
      <MemoryRouter>
        <ContainerProvider value={fromPartial({ ColorGenerator: colorGeneratorMock, apiClientFactory: vi.fn() })}>
          <RoutesPrefixProvider value="/server/abc123">
            <VisitsComparisonProvider
              value={visitsComparison && fromPartial({ canAddItemWithName: () => true, ...visitsComparison })}
            >
              <table>
                <tbody>
                  <TagsTableRow tag={{ tag, visits, shortUrls }} ColorGenerator={colorGeneratorMock} />
                </tbody>
              </table>
            </VisitsComparisonProvider>
          </RoutesPrefixProvider>
        </ContainerProvider>
      </MemoryRouter>,
    );

  const clickMenuItem = async ({ user, ...screen }: RenderWithEventsResult, name: string) => {
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name }));
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [undefined, '0', '0'],
    [{ shortUrls: 10, visits: 3480 }, '10', '3,480'],
  ])('shows expected tag stats', async (stats, expectedShortUrls, expectedVisits) => {
    const screen = await setUp(stats);

    const [shortUrlsLink, visitsLink] = screen.getByRole('link').all();

    await Promise.all([
      expect.element(shortUrlsLink).toMatchTextContent(expectedShortUrls),
      expect
        .element(shortUrlsLink)
        .toHaveAttribute('href', `/server/abc123/list-short-urls/1?tags=${encodeURIComponent(tag)}`),
      expect.element(visitsLink).toMatchTextContent(expectedVisits),
      expect.element(visitsLink).toHaveAttribute('href', `/server/abc123/tag/${tag}/visits`),
    ]);
  });

  it('allows toggling dropdown menu', async () => {
    const { user, ...screen } = await setUp();

    await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    await expect.element(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('allows toggling edit modal', async () => {
    const screen = await setUp();

    await Promise.all([
      expect.element(screen.getByRole('dialog')).not.toBeInTheDocument(),
      expect.element(screen.getByRole('heading', { name: 'Edit tag' })).not.toBeInTheDocument(),
    ]);

    await clickMenuItem(screen, 'Edit');

    await Promise.all([
      expect.element(screen.getByRole('dialog')).toBeInTheDocument(),
      expect.element(screen.getByRole('heading', { name: 'Edit tag' })).toBeInTheDocument(),
    ]);
  });

  it('allows toggling delete modal', async () => {
    const screen = await setUp();

    await Promise.all([
      expect.element(screen.getByRole('dialog')).not.toBeInTheDocument(),
      expect.element(screen.getByRole('heading', { name: 'Delete tag' })).not.toBeInTheDocument(),
    ]);

    await clickMenuItem(screen, 'Delete tag');

    await Promise.all([
      expect.element(screen.getByRole('dialog')).toBeInTheDocument(),
      expect.element(screen.getByRole('heading', { name: 'Delete tag' })).toBeInTheDocument(),
    ]);
  });

  it.each([[undefined], [{ itemsToCompare: [{ name: tag, query: '' }], canAddItemWithName: () => false }]])(
    'has disabled visits comparison menu item when context is not provided or tag is already selected',
    async (visitsComparison) => {
      const { user, ...screen } = await setUp({ visitsComparison });
      await user.click(screen.getByRole('button'));

      await expect.element(screen.getByRole('menuitem', { name: 'Compare visits' })).toHaveAttribute('disabled');
    },
  );

  it('can add tags to compare visits', async () => {
    const addItemToCompare = vi.fn();
    const visitsComparison: Partial<VisitsComparison> = { itemsToCompare: [], addItemToCompare };
    const screen = await setUp({ visitsComparison });

    await clickMenuItem(screen, 'Compare visits');

    expect(addItemToCompare).toHaveBeenCalledWith(
      expect.objectContaining({
        name: tag,
        query: tag,
      }),
    );
  });
});
