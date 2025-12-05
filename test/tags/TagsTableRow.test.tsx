import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../src/container/context';
import { TagsTableRow } from '../../src/tags/TagsTableRow';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import type { VisitsComparison } from '../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

type SetUpOptions = {
  visits?: number;
  shortUrls?: number;
  visitsComparison?: Partial<VisitsComparison>;
};

describe('<TagsTableRow />', () => {
  const tag = 'foo&bar';
  const setUp = ({ visits = 0, shortUrls = 0, visitsComparison }: SetUpOptions = {}) => renderWithStore(
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

  const clickMenuItem = async (user: UserEvent, name: string) => {
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('menuitem', { name }));
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [undefined, '0', '0'],
    [{ shortUrls: 10, visits: 3480 }, '10', '3,480'],
  ])('shows expected tag stats', (stats, expectedShortUrls, expectedVisits) => {
    setUp(stats);

    const [shortUrlsLink, visitsLink] = screen.getAllByRole('link');

    expect(shortUrlsLink).toHaveTextContent(expectedShortUrls);
    expect(shortUrlsLink).toHaveAttribute(
      'href',
      `/server/abc123/list-short-urls/1?tags=${encodeURIComponent(tag)}`,
    );
    expect(visitsLink).toHaveTextContent(expectedVisits);
    expect(visitsLink).toHaveAttribute('href', `/server/abc123/tag/${tag}/visits`);
  });

  it('allows toggling dropdown menu', async () => {
    const { user } = setUp();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(screen.queryByRole('menu')).toBeInTheDocument();
  });

  it('allows toggling edit modal', async () => {
    const { user } = setUp();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Edit tag' })).not.toBeInTheDocument();

    await clickMenuItem(user, 'Edit');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Edit tag' })).toBeInTheDocument();
  });

  it('allows toggling delete modal', async () => {
    const { user } = setUp();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Delete tag' })).not.toBeInTheDocument();

    await clickMenuItem(user, 'Delete tag');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete tag' })).toBeInTheDocument();
  });

  it.each([
    [undefined],
    [{ itemsToCompare: [{ name: tag, query: '' }], canAddItemWithName: () => false }],
  ])(
    'has disabled visits comparison menu item when context is not provided or tag is already selected',
    async (visitsComparison) => {
      const { user } = setUp({ visitsComparison });
      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('menuitem', { name: 'Compare visits' })).toHaveAttribute('disabled');
    },
  );

  it('can add tags to compare visits', async () => {
    const addItemToCompare = vi.fn();
    const visitsComparison: Partial<VisitsComparison> = { itemsToCompare: [], addItemToCompare };
    const { user } = setUp({ visitsComparison });

    await clickMenuItem(user, 'Compare visits');

    expect(addItemToCompare).toHaveBeenCalledWith(expect.objectContaining({
      name: tag,
      query: tag,
    }));
  });
});
