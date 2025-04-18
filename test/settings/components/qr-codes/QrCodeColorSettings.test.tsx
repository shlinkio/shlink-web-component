import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { QrCodeSettings } from '../../../../src/settings';
import { defaultQrCodeSettings , SettingsProvider } from '../../../../src/settings';
import { QrCodeColorSettings } from '../../../../src/settings/components/qr-codes/QrCodeColorSettings';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrCodeColorSettings />', () => {
  const onChange = vi.fn();
  const setUp = (qrCodeSettings?: QrCodeSettings) => renderWithEvents(
    <SettingsProvider value={{ qrCodes: qrCodeSettings }}>
      <QrCodeColorSettings onChange={onChange} />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    {
      settings: undefined,
      expectedColor: defaultQrCodeSettings.color,
      expectedBgColor: defaultQrCodeSettings.bgColor,
    },
    {
      settings: fromPartial<QrCodeSettings>({ color: '#ff0000', bgColor: '#00ff00' }),
      expectedColor: '#ff0000',
      expectedBgColor: '#00ff00',
    },
  ])('shows hints with expected colors', ({ settings, expectedColor, expectedBgColor }) => {
    setUp(settings);

    expect(screen.getByTestId('color')).toHaveTextContent(expectedColor);
    expect(screen.getByLabelText('Default color:')).toHaveValue(expectedColor);
    expect(screen.getByTestId('bg-color')).toHaveTextContent(expectedBgColor);
    expect(screen.getByLabelText('Default background color:')).toHaveValue(expectedBgColor);
  });

  it('can change colors via color pickers', () => {
    const settings = fromPartial<QrCodeSettings>({
      color: '#ff0000',
      bgColor: '#0000ff',
    });
    setUp(settings);

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Default color:'), {
      target: { value: '#f0f0f0' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, color: '#f0f0f0' });

    fireEvent.change(screen.getByLabelText('Default background color:'), {
      target: { value: '#654321' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, bgColor: '#654321' });
  });
});
