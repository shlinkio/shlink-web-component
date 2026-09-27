import { ColorPicker } from '../../../src/utils/components/ColorPicker';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { setNativeInputValue } from '../../__helpers__/input';
import { render } from '../../__helpers__/setUpTest';

describe('<ColorPicker />', () => {
  const onChange = vi.fn();
  const setUp = (color = '#00ff00') => render(<ColorPicker name="name" color={color} onChange={onChange} />);

  it.each([['#000000'], ['#ffffff']])('passes a11y checks', (color) => checkAccessibility(setUp(color)));

  it.each([['#000000'], ['#ffffff']])('invokes onChange when the color is changed', async (value) => {
    const screen = await setUp();
    setNativeInputValue(screen.getByLabelText('name').element() as HTMLInputElement, value);

    expect(onChange).toHaveBeenCalled();
  });

  it.each([['#000000'], ['#ffffff']])('sets provided color in container styles', async (color) => {
    const { container } = await setUp(color);
    await expect
      .element(container.firstChild as HTMLElement)
      .toHaveStyle({ backgroundColor: color, borderColor: color });
  });
});
