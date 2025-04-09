import { render, screen } from '@testing-library/react';
import { ColorInput } from '../../../src/utils/components/ColorInput';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ColorInput />', () => {
  const onChange = vi.fn();
  const setUp = (color = '#00ff00') => render(<ColorInput name="name" color={color} onChange={onChange} />);

  it.each([['#000000'], ['#ffffff']])('passes a11y checks', (color) => checkAccessibility(setUp(color)));

  it('sets color in text and color inputs', () => {
    const color = '#010101';
    setUp(color);

    expect(screen.getByLabelText('name')).toHaveValue(color);
    expect(screen.getByLabelText('name-picker')).toHaveValue(color);
  });
});
