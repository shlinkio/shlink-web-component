import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import { ShortUrlsRowMenuFactory } from '../../../src/short-urls/helpers/ShortUrlsRowMenu';
import { FeaturesProvider } from '../../../src/utils/features';
import type { VisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

type SetUpOptions = {
  visitsComparison?: Partial<VisitsComparison>;
  redirectRulesSupported?: boolean;
};

describe('<ShortUrlsRowMenu />', () => {
  const ShortUrlsRowMenu = ShortUrlsRowMenuFactory(fromPartial({
    DeleteShortUrlModal: () => <i>DeleteShortUrlModal</i>,
    QrCodeModal: () => <i>QrCodeModal</i>,
  }));
  const shortUrl = fromPartial<ShlinkShortUrl>({
    shortCode: 'abc123',
    shortUrl: 'https://s.test/abc123',
  });
  const setUp = ({ visitsComparison, redirectRulesSupported = false }: SetUpOptions = {}) => renderWithEvents(
    <MemoryRouter>
      <FeaturesProvider value={fromPartial({ shortUrlRedirectRules: redirectRulesSupported })}>
        <VisitsComparisonProvider
          value={visitsComparison && fromPartial({ canAddItemWithName: () => true, ...visitsComparison })}
        >
          <ShortUrlsRowMenu shortUrl={shortUrl} />
        </VisitsComparisonProvider>
      </FeaturesProvider>
    </MemoryRouter>,
  );
  const setUpAndOpen = async (options: SetUpOptions = {}) => {
    const result = setUp(options);
    await result.user.click(screen.getByRole('button'));

    return result;
  };

  it.each([
    [setUp],
    [setUpAndOpen],
    [() => setUpAndOpen({
      visitsComparison: { itemsToCompare: [] },
    })],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders modal windows', () => {
    setUp();

    expect(screen.getByText('DeleteShortUrlModal')).toBeInTheDocument();
    expect(screen.getByText('QrCodeModal')).toBeInTheDocument();
  });

  it.each([
    [undefined, false, 4],
    [{ itemsToCompare: [] }, false, 5],
    [undefined, true, 5],
    [{ itemsToCompare: [] }, true, 6],
  ])('renders correct amount of menu items', async (visitsComparison, redirectRulesSupported, expectedMenuItems) => {
    await setUpAndOpen({ visitsComparison, redirectRulesSupported });
    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedMenuItems);
  });

  it.each([
    [{ name: shortUrl.shortUrl }, false],
    [{ name: 'something else' }, true],
  ])('disables visits comparison menu if short URL is already selected', async (visitToCompare, canAddItem) => {
    await setUpAndOpen({
      visitsComparison: fromPartial({
        itemsToCompare: [visitToCompare],
        canAddItemWithName: () => canAddItem,
      }),
    });
    const button = screen.getByRole(!canAddItem ? 'button' : 'menuitem', { name: 'Compare visits' });

    if (canAddItem) {
      expect(button).not.toHaveAttribute('disabled');
    } else {
      expect(button).toHaveAttribute('disabled');
    }
  });

  it('adds visit to compare when clicked', async () => {
    const addVisitToCompare = vi.fn();
    const { user } = await setUpAndOpen({
      visitsComparison: {
        itemsToCompare: [],
        addItemToCompare: addVisitToCompare,
      },
    });

    await user.click(screen.getByRole('menuitem', { name: 'Compare visits' }));
    expect(addVisitToCompare).toHaveBeenCalledWith({
      name: shortUrl.shortUrl,
      query: expect.stringContaining('abc123'),
    });
  });
});
