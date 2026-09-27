import { QrDimensionControl } from '../../../../src/short-urls/helpers/qr-codes/QrDimensionControl';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { setNativeInputValue } from '../../../__helpers__/input';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

type SetUpOptions = {
  value?: number;
  name?: string;
};

describe('<QrDimensionControl />', () => {
  const onChange = vi.fn();
  const setUp = ({ name = 'the dimension', value }: SetUpOptions = {}) =>
    renderWithEvents(<QrDimensionControl name={name} value={value ?? 30} onChange={onChange} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([{ value: undefined }, { value: 15 }])('shows a range slider', async ({ value }) => {
    const screen = await setUp({ value });
    await expect.element(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('can change selected value in slider', async () => {
    const screen = await setUp({ value: 12 });

    setNativeInputValue(screen.getByRole('slider').element() as HTMLInputElement, '30');
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it.each([
    { name: 'size', expectedLabelText: 'size: 15px' },
    { name: 'margin', expectedLabelText: 'margin: 15px' },
  ])('shows name in slider', async ({ name, expectedLabelText }) => {
    const screen = await setUp({ name, value: 15 });
    await expect.element(screen.getByText(expectedLabelText)).toBeInTheDocument();
  });
});
