import { ExportBtn } from '../../../src/utils/components/ExportBtn';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<ExportBtn />', () => {
  const setUp = (amount?: number, loading = false) => render(<ExportBtn amount={amount} loading={loading} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [true, 'Exporting...'],
    [false, 'Export (0)'],
  ])('renders loading state when expected', async (loading, text) => {
    const screen = await setUp(undefined, loading);
    const btn = screen.getByRole('button');

    await expect.element(btn).toHaveTextContent(text);
    if (loading) {
      await expect.element(btn).toHaveAttribute('disabled');
    } else {
      await expect.element(btn).not.toHaveAttribute('disabled');
    }
  });

  it.each([
    [undefined, '0'],
    [10, '10'],
    [10_000, '10,000'],
    [10_000_000, '10,000,000'],
  ])('renders expected amount', async (amount, expectedRenderedAmount) => {
    const screen = await setUp(amount);
    await expect.element(screen.getByRole('button')).toHaveTextContent(`Export (${expectedRenderedAmount})`);
  });

  it('renders expected icon', async () => {
    const screen = await setUp();
    expect(screen.getByRole('img', { includeHidden: true }).element()).toMatchSnapshot();
  });
});
