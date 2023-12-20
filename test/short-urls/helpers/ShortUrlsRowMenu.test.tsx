import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import { ShortUrlsRowMenuFactory } from '../../../src/short-urls/helpers/ShortUrlsRowMenu';
import type { VisitsComparison, VisitsComparisonItem,
} from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import {
  VisitsComparisonProvider } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
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
  const setUp = (visitsComparison?: VisitsComparison) => renderWithEvents(
    <MemoryRouter>
      <VisitsComparisonProvider value={visitsComparison}>
        <ShortUrlsRowMenu shortUrl={shortUrl} />
      </VisitsComparisonProvider>
    </MemoryRouter>,
  );
  const setUpAndOpen = async (visitsComparison?: VisitsComparison) => {
    const result = setUp(visitsComparison);
    await result.user.click(screen.getByRole('button'));

    return result;
  };

  it.each([
    [setUp],
    [setUpAndOpen],
    [() => setUpAndOpen(fromPartial({ itemsToCompare: [] }))],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders modal windows', () => {
    setUp();

    expect(screen.getByText('DeleteShortUrlModal')).toBeInTheDocument();
    expect(screen.getByText('QrCodeModal')).toBeInTheDocument();
  });

  it.each([
    [undefined, 4],
    [fromPartial<VisitsComparison>({ itemsToCompare: [] }), 5],
  ])('renders correct amount of menu items', async (visitsComparison, expectedMenuItems) => {
    await setUpAndOpen(visitsComparison);
    expect(screen.getAllByRole('menuitem')).toHaveLength(expectedMenuItems);
  });

  it.each([
    [fromPartial<VisitsComparisonItem>({ name: shortUrl.shortUrl }), true],
    [fromPartial<VisitsComparisonItem>({ name: 'something else' }), false],
  ])('disables visits comparison menu if short URL is already selected', async (visitToCompare, hasAttribute) => {
    await setUpAndOpen(fromPartial({
      itemsToCompare: [visitToCompare],
    }));
    const button = screen.getByRole(hasAttribute ? 'button' : 'menuitem', { name: 'Compare visits' });

    if (hasAttribute) {
      expect(button).toHaveAttribute('disabled');
    } else {
      expect(button).not.toHaveAttribute('disabled');
    }
  });

  it('adds visit to compare when clicked', async () => {
    const addVisitToCompare = vi.fn();
    const { user } = await setUpAndOpen(fromPartial({
      itemsToCompare: [],
      addItemToCompare: addVisitToCompare,
    }));

    await user.click(screen.getByRole('menuitem', { name: 'Compare visits' }));
    expect(addVisitToCompare).toHaveBeenCalledWith({
      name: shortUrl.shortUrl,
      query: expect.stringContaining('abc123'),
    });
  });
});
