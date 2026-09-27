import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { Domain } from '../../../src/domains/data';
import { DEFAULT_DOMAIN } from '../../../src/domains/data';
import { DomainDropdown } from '../../../src/domains/helpers/DomainDropdown';
import { FeaturesProvider } from '../../../src/utils/features';
import { RoutesPrefixProvider } from '../../../src/utils/routesPrefix';
import type { VisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithStore } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  domain?: Domain;
  visitsComparison?: Partial<VisitsComparison>;
  filterShortUrlsByDomain?: boolean;
};

describe('<DomainDropdown />', () => {
  const setUp = ({ domain, visitsComparison, filterShortUrlsByDomain = true }: SetUpOptions = {}) =>
    renderWithStore(
      <MemoryRouter>
        <VisitsComparisonProvider
          value={visitsComparison && fromPartial({ canAddItemWithName: () => true, ...visitsComparison })}
        >
          <RoutesPrefixProvider value="/server/123">
            <FeaturesProvider value={fromPartial({ filterShortUrlsByDomain })}>
              <DomainDropdown domain={domain ?? fromPartial({})} />
            </FeaturesProvider>
          </RoutesPrefixProvider>
        </VisitsComparisonProvider>
      </MemoryRouter>,
    );

  const openMenu = async ({ user, ...screen }: RenderWithEventsResult) => {
    // Search by "Options" name, as that's the default aria-label
    await user.click(screen.getByRole('button', { name: 'Options' }));
  };

  it.each([
    [setUp],
    [
      async () => {
        const result = await setUp({ visitsComparison: { itemsToCompare: [] } });
        await openMenu(result);

        return result;
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([{ filterShortUrlsByDomain: true }, { filterShortUrlsByDomain: false }])(
    'renders expected menu items',
    async ({ filterShortUrlsByDomain }) => {
      const screen = await setUp({ filterShortUrlsByDomain });
      await openMenu(screen);

      await expect.element(screen.getByText('Visit stats')).toBeInTheDocument();
      await expect.element(screen.getByText('Compare visits')).toBeInTheDocument();
      await expect.element(screen.getByText('Edit redirects')).toBeInTheDocument();

      if (filterShortUrlsByDomain) {
        await expect.element(screen.getByText('Short URLs')).toBeInTheDocument();
      } else {
        await expect.element(screen.getByText('Short URLs')).not.toBeInTheDocument();
      }
    },
  );

  it.each([
    [true, '_DEFAULT'],
    [false, ''],
  ])('points visits link to the proper section', async (isDefault, expectedLink) => {
    const screen = await setUp({ domain: fromPartial({ domain: 'foo.com', isDefault }) });
    await openMenu(screen);

    await expect
      .element(screen.getByText('Visit stats'))
      .toHaveAttribute('href', `/server/123/domain/foo.com${expectedLink}/visits`);
  });

  it.each([
    [true, DEFAULT_DOMAIN],
    [false, 'foo.com'],
  ])('points short URLs link to the proper section', async (isDefault, expectedLink) => {
    const screen = await setUp({ domain: fromPartial({ domain: 'foo.com', isDefault }) });
    await openMenu(screen);

    await expect
      .element(screen.getByText('Short URLs'))
      .toHaveAttribute('href', `/server/123/list-short-urls/1?domain=${expectedLink}`);
  });

  it.each([['foo.com'], ['bar.org'], ['baz.net']])('displays modal when editing redirects', async (domain) => {
    const { user, ...screen } = await setUp({ domain: fromPartial({ domain, isDefault: false }) });

    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('form')).not.toBeInTheDocument();
    await openMenu({ user, ...screen });

    await user.click(screen.getByText('Edit redirects'));
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays dropdown when clicked', async () => {
    const screen = await setUp();

    await expect.element(screen.getByRole('menu')).not.toBeInTheDocument();
    await openMenu(screen);
    await expect.element(screen.getByRole('menu')).toBeInTheDocument();
  });

  it.each([[undefined], [{ itemsToCompare: [{ name: 's.test', query: '' }], canAddItemWithName: () => false }]])(
    'disables compare visits item when it cannot be added',
    async (visitsComparison) => {
      const screen = await setUp({ visitsComparison, domain: fromPartial({ domain: 's.test' }) });
      await openMenu(screen);

      await expect.element(screen.getByRole('menuitem', { name: 'Compare visits' })).toBeDisabled();
    },
  );

  it('can add items to compare visits', async () => {
    const addItemToCompare = vi.fn();
    const visitsComparison: Partial<VisitsComparison> = { itemsToCompare: [], addItemToCompare };
    const domain = 's.test';
    const { user, ...screen } = await setUp({ visitsComparison, domain: fromPartial({ domain }) });

    await openMenu({ user, ...screen });
    const item = screen.getByRole('menuitem', { name: 'Compare visits' });

    await expect.element(item).not.toHaveAttribute('disabled');
    await user.click(item);

    expect(addItemToCompare).toHaveBeenCalledWith({ name: domain, query: domain });
  });
});
