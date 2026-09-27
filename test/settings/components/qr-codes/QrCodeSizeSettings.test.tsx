import { fromPartial } from '@total-typescript/shoehorn';
import type { QrCodeSettings } from '../../../../src/settings';
import { defaultQrCodeSettings, SettingsProvider } from '../../../../src/settings';
import { QrCodeSizeSettings } from '../../../../src/settings/components/qr-codes/QrCodeSizeSettings';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { setNativeInputValue } from '../../../__helpers__/input';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrCodeSizeSettings />', () => {
  const onChange = vi.fn();
  const setUp = (qrCodeSettings?: QrCodeSettings) =>
    renderWithEvents(
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
  ])('shows hints with expected sizes', async ({ settings, expectedSize, expectedMargin }) => {
    const screen = await setUp(settings);

    await Promise.all([
      expect.element(screen.getByTestId('size')).toHaveTextContent(`${expectedSize}x${expectedSize}px`),
      expect.element(screen.getByLabelText('Default dimensions:')).toHaveValue(`${expectedSize}`),
      expect.element(screen.getByTestId('margin')).toHaveTextContent(`${expectedMargin}px`),
      expect.element(screen.getByLabelText('Default margin:')).toHaveValue(`${expectedMargin}`),
    ]);
  });

  it('can change sizes via range inputs', async () => {
    const settings = fromPartial<QrCodeSettings>({
      size: 800,
      margin: 35,
    });
    const screen = await setUp(settings);

    expect(onChange).not.toHaveBeenCalled();

    setNativeInputValue(screen.getByLabelText('Default dimensions:').element() as HTMLInputElement, '200');
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, size: 200 });

    setNativeInputValue(screen.getByLabelText('Default margin:').element() as HTMLInputElement, '40');
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, margin: 40 });
  });
});
