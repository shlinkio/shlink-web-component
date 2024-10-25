import { fireEvent, render, screen } from '@testing-library/react';
import { ColorPicker } from '../../../src/utils/components/ColorPicker';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ColorPicker />', () => {
  const onChange = vi.fn();
  const setUp = (color = '#00ff00') => render(<ColorPicker name="name" color={color} onChange={onChange} />);

  it.each([['#000000'], ['#ffffff']])('passes a11y checks', (color) => checkAccessibility(setUp(color)));

  it.each([['#000000'], ['#ffffff']])('invokes onChange when the color is changed', (value) => {
    setUp();
    fireEvent.change(screen.getByLabelText('name'), { target: { value } });

    expect(onChange).toHaveBeenCalled();
  });

  it.each([['#000000'], ['#ffffff']])('sets provided color in container styles', (color) => {
    const { container } = setUp(color);
    expect(container.firstChild).toHaveStyle({ backgroundColor: color, borderColor: color });
  });
});
