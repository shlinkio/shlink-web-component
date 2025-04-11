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
    <QrDimensionControl name={name} value={value ?? 30} onChange={onChange} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { value: undefined },
    { value: 15 },
  ])('shows a range slider', ({ value }) => {
    setUp({ value });
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('can change selected value in slider', () => {
    setUp({ value: 12 });

    fireEvent.change(screen.getByRole('slider'), {
      target: { value: '30' },
    });
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it.each([
    { name: 'size', expectedLabelText: 'size: 15px' },
    { name: 'margin', expectedLabelText: 'margin: 15px' },
  ])('shows name in slider', ({ name, expectedLabelText }) => {
    setUp({ name, value: 15 });
    expect(screen.getByText(expectedLabelText)).toBeInTheDocument();
  });
});
