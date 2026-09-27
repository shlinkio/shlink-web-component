import { fromPartial } from '@total-typescript/shoehorn';
import type { QrCodeSettings } from '../../../../src/settings';
import { defaultQrCodeSettings, SettingsProvider } from '../../../../src/settings';
import { QrCodeFormatSettings } from '../../../../src/settings/components/qr-codes/QrCodeFormatSettings';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrCodeFormatSettings />', () => {
  const onChange = vi.fn();
  const setUp = (qrCodeSettings?: QrCodeSettings) =>
    renderWithEvents(
      <SettingsProvider value={{ qrCodes: qrCodeSettings }}>
        <QrCodeFormatSettings onChange={onChange} />
      </SettingsProvider>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    {
      settings: undefined,
      expectedFormat: defaultQrCodeSettings.format,
      expectedErrorCorrection: defaultQrCodeSettings.errorCorrection,
    },
    {
      settings: fromPartial<QrCodeSettings>({ format: 'svg', errorCorrection: 'Q' }),
      expectedFormat: 'svg',
      expectedErrorCorrection: 'Q',
    },
  ])('shows hints with expected colors', async ({ settings, expectedFormat, expectedErrorCorrection }) => {
    const screen = await setUp(settings);

    await expect.element(screen.getByTestId('format')).toHaveTextContent(expectedFormat);
    await expect.element(screen.getByRole('button', { name: `Format (${expectedFormat})` })).toBeInTheDocument();
    await expect.element(screen.getByTestId('error-correction')).toHaveTextContent(expectedErrorCorrection);
    await expect
      .element(screen.getByRole('button', { name: `Error correction (${expectedErrorCorrection})` }))
      .toBeInTheDocument();
  });

  it('can change colors via color pickers', async () => {
    const settings = fromPartial<QrCodeSettings>({
      format: 'svg',
      errorCorrection: 'Q',
    });
    const { user, ...screen } = await setUp(settings);

    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Format (svg)' }));
    await user.click(screen.getByRole('menuitem', { name: 'webp' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, format: 'webp' });

    await user.click(screen.getByRole('button', { name: 'Error correction (Q)' }));
    await user.click(screen.getByRole('menuitem', { name: /edium$/ }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, errorCorrection: 'M' });
  });
});
