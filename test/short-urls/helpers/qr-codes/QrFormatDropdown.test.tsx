import { screen } from '@testing-library/react';
import { QrFormatDropdown } from '../../../../src/short-urls/helpers/qr-codes/QrFormatDropdown';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrFormatDropdown />', () => {
  const setFormat = vi.fn();
  const setUp = () => renderWithEvents(<QrFormatDropdown format="svg" onChange={setFormat} />);

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

    expect(items[0]).toHaveAttribute('data-selected', 'false');
    expect(items[1]).toHaveAttribute('data-selected', 'true');
    expect(items[2]).toHaveAttribute('data-selected', 'false');
    expect(items[3]).toHaveAttribute('data-selected', 'false');
  });

  it('invokes callback when items are clicked', async () => {
    const { user } = setUp();
    const clickItem = async (name: string) => {
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    expect(setFormat).not.toHaveBeenCalled();

    await clickItem('png');
    expect(setFormat).toHaveBeenCalledWith('png');

    await clickItem('svg');
    expect(setFormat).toHaveBeenCalledWith('svg');

    await clickItem('webp');
    expect(setFormat).toHaveBeenCalledWith('webp');

    await clickItem('jpeg');
    expect(setFormat).toHaveBeenCalledWith('jpeg');
  });
});
