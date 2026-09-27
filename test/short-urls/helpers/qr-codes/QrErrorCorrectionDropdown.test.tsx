import type { QrErrorCorrection } from '../../../../src/settings';
import { QrErrorCorrectionDropdown } from '../../../../src/short-urls/helpers/qr-codes/QrErrorCorrectionDropdown';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrErrorCorrectionDropdown />', () => {
  const initialErrorCorrection: QrErrorCorrection = 'Q';
  const setErrorCorrection = vi.fn();
  const setUp = () =>
    renderWithEvents(
      <QrErrorCorrectionDropdown errorCorrection={initialErrorCorrection} onChange={setErrorCorrection} />,
    );

  it.each([
    [setUp],
    [
      async () => {
        const { user, container, ...screen } = await setUp();
        await user.click(screen.getByRole('button'));

        return { container };
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders initial state', async () => {
    const { user, ...screen } = await setUp();
    const btn = screen.getByRole('button');

    await expect.element(btn).toHaveTextContent('Error correction (Q)');
    await user.click(btn);
    const items = screen.getByRole('menuitem').all();

    await expect.element(items[0]).toHaveAttribute('data-selected', 'false');
    await expect.element(items[1]).toHaveAttribute('data-selected', 'false');
    await expect.element(items[2]).toHaveAttribute('data-selected', 'true');
    await expect.element(items[3]).toHaveAttribute('data-selected', 'false');
  });

  it('invokes callback when items are clicked', async () => {
    const { user, ...screen } = await setUp();
    const clickItem = async (name: string | RegExp) => {
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    expect(setErrorCorrection).not.toHaveBeenCalled();

    await clickItem(/ow/);
    expect(setErrorCorrection).toHaveBeenCalledWith('L');

    await clickItem(/edium/);
    expect(setErrorCorrection).toHaveBeenCalledWith('M');

    await clickItem(/uartile/);
    expect(setErrorCorrection).toHaveBeenCalledWith('Q');

    await clickItem(/igh/);
    expect(setErrorCorrection).toHaveBeenCalledWith('H');
  });
});
