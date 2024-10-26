import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { QrCodeModalFactory } from '../../../src/short-urls/helpers/QrCodeModal';
import { FeaturesProvider } from '../../../src/utils/features';
import type { ImageDownloader } from '../../../src/utils/services/ImageDownloader';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<QrCodeModal />', () => {
  const saveImage = vi.fn().mockReturnValue(Promise.resolve());
  const QrCodeModal = QrCodeModalFactory(fromPartial({
    ImageDownloader: fromPartial<ImageDownloader>({ saveImage }),
  }));
  const shortUrl = 'https://s.test/abc123';
  const setUp = ({ qrCodeColors = false }: { qrCodeColors?: boolean } = {}) => renderWithEvents(
    <FeaturesProvider value={fromPartial({ qrCodeColors })}>
      <QrCodeModal
        isOpen
        shortUrl={fromPartial({ shortUrl })}
        toggle={() => {}}
      />
    </FeaturesProvider>,
  );

  it.each([{ qrCodeColors: false }, { qrCodeColors: true }])(
    'passes a11y checks',
    ({ qrCodeColors }) => checkAccessibility(setUp({ qrCodeColors })),
  );

  it('shows an external link to the URL in the header', () => {
    setUp();
    const externalLink = screen.getByRole('heading').querySelector('a');

    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute('href', shortUrl);
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays an image with the QR code of the URL', async () => {
    const { user } = setUp({ qrCodeColors: true });
    const assertUrl = (url: string) => {
      expect(screen.getByRole('img')).toHaveAttribute('src', url);
      expect(screen.getByText(url)).toHaveAttribute('href', url);
    };

    // Initially, no arguments are appended
    assertUrl(`${shortUrl}/qr-code`);

    // Switch to sliders
    await user.click(screen.getByRole('button', { name: 'Customize size' }));
    await user.click(screen.getByRole('button', { name: 'Customize margin' }));

    const [sizeInput, marginInput] = screen.getAllByRole('slider');
    if (!sizeInput || !marginInput) {
      throw new Error('Sliders not found');
    }

    // Setting size and margin should reflect in the QR code URL
    fireEvent.change(sizeInput, { target: { value: '560' } });
    fireEvent.change(marginInput, { target: { value: '20' } });
    assertUrl(`${shortUrl}/qr-code?size=560&margin=20`);

    // Unset margin and select error correction
    await user.click(screen.getByRole('button', { name: 'Default margin' }));
    await user.click(screen.getByRole('button', { name: 'Default error correction' }));
    await user.click(screen.getByRole('menuitem', { name: /uartile/ }));
    assertUrl(`${shortUrl}/qr-code?size=560&errorCorrection=Q`);

    // Set custom color
    await user.click(screen.getByRole('button', { name: 'Customize color' }));
    assertUrl(`${shortUrl}/qr-code?size=560&errorCorrection=Q&color=000000`);
  });

  it.each([
    { qrCodeColors: false, expectedButtons: 4 },
    { qrCodeColors: true, expectedButtons: 6 },
  ])('shows expected buttons', ({ expectedButtons, qrCodeColors }) => {
    setUp({ qrCodeColors });

    // Add three because of the close, download and copy-to-clipboard buttons
    expect(screen.getAllByRole('button')).toHaveLength(expectedButtons + 3);
  });

  it('saves the QR code image when clicking the Download button', async () => {
    const { user } = setUp();

    expect(saveImage).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /^Download/ }));
    expect(saveImage).toHaveBeenCalledOnce();
  });
});
