import { screen } from '@testing-library/react';
import { QrColorControl } from '../../../../src/short-urls/helpers/qr-codes/QrColorControl';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrColorControl />', () => {
  const setUp = (color?: string) => renderWithEvents(
    <QrColorControl name="foo" color={color} initialColor="#ff0000" onChange={vi.fn()} />,
  );

  it.each([
    [setUp],
    [() => setUp('#000000')],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    { color: undefined, hasColorPicker: false },
    { color: '#0000ff', hasColorPicker: true },
  ])('shows a color picker when the value is set', ({ color, hasColorPicker }) => {
    const { container } = setUp(color);

    if (hasColorPicker) {
      expect(container.querySelector('input[type="color"]')).toBeInTheDocument();
      expect(screen.queryByText('Customize foo')).not.toBeInTheDocument();
    } else {
      expect(container.querySelector('input[type="color"]')).not.toBeInTheDocument();
      expect(screen.getByText('Customize foo')).toBeInTheDocument();
    }
  });
});
