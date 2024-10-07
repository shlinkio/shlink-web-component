import { fireEvent, screen } from '@testing-library/react';
import { QrDimensionControl } from '../../../../src/short-urls/helpers/qr-codes/QrDimensionControl';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

type SetUpOptions = {
  value?: number;
  name?: string;
};

describe('<QrDimensionControl />', () => {
  const onChange = vi.fn();
  const setUp = ({ name = 'the dimension', value }: SetUpOptions = {}) => renderWithEvents(
    <QrDimensionControl name={name} value={value} initial={30} onChange={onChange} />,
  );

  it.each([
    [setUp],
    [() => setUp({ value: 15 })],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    { value: undefined, hasSlider: false },
    { value: 15, hasSlider: true },
  ])('shows a range slider when the value is set', ({ value, hasSlider }) => {
    setUp({ value });

    if (hasSlider) {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    }
  });

  it.each([
    { value: undefined, expectedChangedValue: 30 },
    { value: 12, expectedChangedValue: undefined },
  ])('can switch from button to slider and back', async ({ value, expectedChangedValue }) => {
    const { user } = setUp({ value });

    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(expectedChangedValue);
  });

  it('can change selected value in slider', () => {
    setUp({ value: 12 });

    fireEvent.change(screen.getByRole('slider'), {
      target: { value: '30' },
    });
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it.each([
    { name: 'size', expectedText: 'Customize size' },
    { name: 'margin', expectedText: 'Customize margin' },
  ])('shows name in default button', ({ name, expectedText }) => {
    setUp({ name });
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it.each([
    { name: 'size', expectedLabelText: 'size: 15px', expectedButtonText: 'Default size' },
    { name: 'margin', expectedLabelText: 'margin: 15px', expectedButtonText: 'Default margin' },
  ])('shows name in slider', ({ name, expectedLabelText, expectedButtonText }) => {
    setUp({ name, value: 15 });

    const button = screen.getByLabelText(expectedButtonText);

    expect(screen.getByText(expectedLabelText)).toBeInTheDocument();
    expect(button).toHaveAttribute('title', expectedButtonText);
  });
});
