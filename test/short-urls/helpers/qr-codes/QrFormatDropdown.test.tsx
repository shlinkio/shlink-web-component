import { screen } from '@testing-library/react';
import { QrFormatDropdown } from '../../../../src/short-urls/helpers/qr-codes/QrFormatDropdown';
import type { QrCodeFormat } from '../../../../src/utils/helpers/qrCodes';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrFormatDropdown />', () => {
  const initialFormat: QrCodeFormat = 'svg';
  const setFormat = vi.fn();
  const setUp = () => renderWithEvents(<QrFormatDropdown format={initialFormat} onChange={setFormat} />);

  it.each([
    [setUp],
    [async () => {
      const { user, container } = setUp();
      await user.click(screen.getByRole('button'));

      return { container };
    }],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders initial state', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button');

    expect(btn).toHaveTextContent('Format (svg');
    await user.click(btn);
    const items = screen.getAllByRole('menuitem');

    expect(items[0]).not.toHaveClass('active');
    expect(items[1]).not.toHaveClass('active');
    expect(items[2]).toHaveClass('active');
  });

  it('invokes callback when items are clicked', async () => {
    const { user } = setUp();
    const clickItem = async (name: string) => {
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    expect(setFormat).not.toHaveBeenCalled();

    await clickItem('PNG');
    expect(setFormat).toHaveBeenCalledWith('png');

    await clickItem('SVG');
    expect(setFormat).toHaveBeenCalledWith('svg');

    await clickItem('Default');
    expect(setFormat).toHaveBeenCalledWith(undefined);
  });
});
