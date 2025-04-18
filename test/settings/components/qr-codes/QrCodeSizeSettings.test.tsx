import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { QrCodeSettings } from '../../../../src/settings';
import { defaultQrCodeSettings, SettingsProvider } from '../../../../src/settings';
import { QrCodeSizeSettings } from '../../../../src/settings/components/qr-codes/QrCodeSizeSettings';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrCodeSizeSettings />', () => {
  const onChange = vi.fn();
  const setUp = (qrCodeSettings?: QrCodeSettings) => renderWithEvents(
    <SettingsProvider value={{ qrCodes: qrCodeSettings }}>
      <QrCodeSizeSettings onChange={onChange} />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    {
      settings: undefined,
      expectedSize: defaultQrCodeSettings.size,
      expectedMargin: defaultQrCodeSettings.margin,
    },
    {
      settings: fromPartial<QrCodeSettings>({ size: 580, margin: 20 }),
      expectedSize: 580,
      expectedMargin: 20,
    },
  ])('shows hints with expected sizes', ({ settings, expectedSize, expectedMargin }) => {
    setUp(settings);

    expect(screen.getByTestId('size')).toHaveTextContent(`${expectedSize}x${expectedSize}px`);
    expect(screen.getByLabelText('Default dimensions:')).toHaveValue(`${expectedSize}`);
    expect(screen.getByTestId('margin')).toHaveTextContent(`${expectedMargin}px`);
    expect(screen.getByLabelText('Default margin:')).toHaveValue(`${expectedMargin}`);
  });

  it('can change sizes via range inputs', () => {
    const settings = fromPartial<QrCodeSettings>({
      size: 800,
      margin: 35,
    });
    setUp(settings);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Default dimensions:'), {
      target: { value: '200' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, size: 200 });

    fireEvent.change(screen.getByLabelText('Default margin:'), {
      target: { value: '40' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, margin: 40 });
  });
});
