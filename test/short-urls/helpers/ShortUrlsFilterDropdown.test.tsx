import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Domain } from '../../../src/domains/data';
import type { ShortUrlsFilter } from '../../../src/short-urls/data';
import { ShortUrlsFilterDropdown } from '../../../src/short-urls/helpers/ShortUrlsFilterDropdown';
import { FeaturesProvider } from '../../../src/utils/features';
import { DEFAULT_DOMAIN } from '../../../src/visits/reducers/domainVisits';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  filterDisabledUrls?: boolean;
  filterShortUrlsByDomain?: boolean;
  selected?: ShortUrlsFilter;
};

describe('<ShortUrlsFilterDropdown />', () => {
  const domains: Domain[] = [
    fromPartial({ domain: 's.test', isDefault: true }),
    fromPartial({ domain: 's2.test', isDefault: false }),
    fromPartial({ domain: 's3.test', isDefault: false }),
  ] as const;
  const onChange = vi.fn();
  const setUp = ({
    filterDisabledUrls = false,
    filterShortUrlsByDomain = false,
    selected,
  }: SetUpOptions = {}) => renderWithEvents(
    <FeaturesProvider value={fromPartial({ filterDisabledUrls, filterShortUrlsByDomain })}>
      <ShortUrlsFilterDropdown onChange={onChange} domains={domains} selected={selected} />
    </FeaturesProvider>,
  );
  const openMenu = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Filters' }));

  const setUpOpened = async (options?: SetUpOptions) => {
    const { user, ...rest } = setUp(options);

    await openMenu(user);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    return { user, ...rest };
  };

  it.each([
    [() => setUp({ filterDisabledUrls: true })],
    [() => setUp({ filterShortUrlsByDomain: true })],
    [() => setUp({ filterDisabledUrls: true, filterShortUrlsByDomain: true })],
    // TODO Enable back once https://github.com/reactstrap/reactstrap/issues/2759 is fixed
    // [() => setUpOpened({ filterDisabledUrls: true, filterShortUrlsByDomain: true })],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    { filterDisabledUrls: false, filterShortUrlsByDomain: false, expectedItems: 1 },
    { filterDisabledUrls: true, filterShortUrlsByDomain: false, expectedItems: 3 },
    { filterDisabledUrls: true, filterShortUrlsByDomain: true, expectedItems: 3 + domains.length },
  ])('displays proper amount of menu items', async ({ filterDisabledUrls, filterShortUrlsByDomain, expectedItems }) => {
    await setUpOpened({ filterDisabledUrls, filterShortUrlsByDomain });
    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedItems);
  });

  it.each([
    { domain: DEFAULT_DOMAIN, expectedSelectedIndex: 0 },
    { domain: domains[1].domain, expectedSelectedIndex: 1 },
    { domain: domains[2].domain, expectedSelectedIndex: 2 },
  ])('selects the right domain', async ({ domain, expectedSelectedIndex }) => {
    await setUpOpened({
      filterShortUrlsByDomain: true,
      selected: { domain },
    });

    const menuItems = screen.getAllByRole('menuitem');
    menuItems.forEach((menuItem, index) => {
      // Add one to expected index, as there's one item rendered before the domains
      if (index === expectedSelectedIndex + 1) {
        expect(menuItem).toHaveClass('active');
      } else {
        expect(menuItem).not.toHaveClass('active');
      }
    });
  });

  it.each([
    { clickedDomain: domains[0].domain, expectedDomain: DEFAULT_DOMAIN },
    { clickedDomain: domains[1].domain, expectedDomain: undefined }, // Selected one. Will be deselected
    { clickedDomain: domains[2].domain, expectedDomain: domains[2].domain },
  ])('selects or deselects a domain when clicked', async ({ clickedDomain, expectedDomain }) => {
    const { user } = await setUpOpened({
      filterShortUrlsByDomain: true,
      selected: { domain: domains[1].domain },
    });

    await user.click(screen.getByText(clickedDomain));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      domain: expectedDomain,
    }));
  });
});
