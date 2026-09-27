import { fromPartial } from '@total-typescript/shoehorn';
import type { QrCodeSettings } from '../../../../src/settings';
import { defaultQrCodeSettings, SettingsProvider } from '../../../../src/settings';
import { QrCodeColorSettings } from '../../../../src/settings/components/qr-codes/QrCodeColorSettings';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { setNativeInputValue } from '../../../__helpers__/input';
import { render } from '../../../__helpers__/setUpTest';

describe('<QrCodeColorSettings />', () => {
  const onChange = vi.fn();
  const setUp = (qrCodeSettings?: QrCodeSettings) =>
    render(
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
  ])('shows hints with expected colors', async ({ settings, expectedColor, expectedBgColor }) => {
    const screen = await setUp(settings);

    await Promise.all([
      expect.element(screen.getByTestId('color')).toHaveTextContent(expectedColor),
      expect.element(screen.getByLabelText('Default color:')).toHaveValue(expectedColor),
      expect.element(screen.getByTestId('bg-color')).toHaveTextContent(expectedBgColor),
      expect.element(screen.getByLabelText('Default background color:')).toHaveValue(expectedBgColor),
    ]);
  });

  it('can change colors via color pickers', async () => {
    const settings = fromPartial<QrCodeSettings>({
      color: '#ff0000',
      bgColor: '#0000ff',
    });
    const screen = await setUp(settings);

    expect(onChange).not.toHaveBeenCalled();

    setNativeInputValue(screen.getByLabelText('Default color:').element() as HTMLInputElement, '#f0f0f0');
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, color: '#f0f0f0' });

    setNativeInputValue(screen.getByLabelText('Default background color:').element() as HTMLInputElement, '#654321');
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, bgColor: '#654321' });
  });
});
