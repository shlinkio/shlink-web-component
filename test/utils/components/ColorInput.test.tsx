import { ColorInput } from '../../../src/utils/components/ColorInput';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<ColorInput />', () => {
  const onChange = vi.fn();
  const setUp = (color = '#00ff00') => render(<ColorInput name="name" color={color} onChange={onChange} />);

  it.each([['#000000'], ['#ffffff']])('passes a11y checks', (color) => checkAccessibility(setUp(color)));

  it('sets color in text and color inputs', async () => {
    const color = '#010101';
    const screen = await setUp(color);

    await Promise.all([
      expect.element(screen.getByLabelText('name')).toHaveValue(color),
      expect.element(screen.getByLabelText('name picker')).toHaveValue(color),
    ]);
  });
});
