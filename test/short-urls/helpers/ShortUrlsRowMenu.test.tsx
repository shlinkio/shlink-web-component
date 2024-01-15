import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import { ShortUrlsRowMenuFactory } from '../../../src/short-urls/helpers/ShortUrlsRowMenu';
import type { VisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { VisitsComparisonProvider } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsRowMenu />', () => {
  const ShortUrlsRowMenu = ShortUrlsRowMenuFactory(fromPartial({
    DeleteShortUrlModal: () => <i>DeleteShortUrlModal</i>,
    QrCodeModal: () => <i>QrCodeModal</i>,
  }));
  const shortUrl = fromPartial<ShlinkShortUrl>({
    shortCode: 'abc123',
    shortUrl: 'https://s.test/abc123',
  });
  const setUp = (visitsComparison?: Partial<VisitsComparison>) => renderWithEvents(
    <MemoryRouter>
      <VisitsComparisonProvider
        value={visitsComparison && fromPartial({ canAddItemWithName: () => true, ...visitsComparison })}
      >
        <ShortUrlsRowMenu shortUrl={shortUrl} />
      </VisitsComparisonProvider>
    </MemoryRouter>,
  );
  const setUpAndOpen = async (visitsComparison?: Partial<VisitsComparison>) => {
    const result = setUp(visitsComparison);
    await result.user.click(screen.getByRole('button'));

    return result;
  };

  it.each([
    [setUp],
    [setUpAndOpen],
    [() => setUpAndOpen({ itemsToCompare: [] })],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders modal windows', () => {
    setUp();

    expect(screen.getByText('DeleteShortUrlModal')).toBeInTheDocument();
    expect(screen.getByText('QrCodeModal')).toBeInTheDocument();
  });

  it.each([
    [undefined, 4],
    [{ itemsToCompare: [] }, 5],
  ])('renders correct amount of menu items', async (visitsComparison, expectedMenuItems) => {
    await setUpAndOpen(visitsComparison);
    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedMenuItems);
  });

  it.each([
    [{ name: shortUrl.shortUrl }, false],
    [{ name: 'something else' }, true],
  ])('disables visits comparison menu if short URL is already selected', async (visitToCompare, canAddItem) => {
    await setUpAndOpen(fromPartial({
      itemsToCompare: [visitToCompare],
      canAddItemWithName: () => canAddItem,
    }));
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
      itemsToCompare: [],
      addItemToCompare: addVisitToCompare,
    });

    await user.click(screen.getByRole('menuitem', { name: 'Compare visits' }));
    expect(addVisitToCompare).toHaveBeenCalledWith({
      name: shortUrl.shortUrl,
      query: expect.stringContaining('abc123'),
    });
  });
});
