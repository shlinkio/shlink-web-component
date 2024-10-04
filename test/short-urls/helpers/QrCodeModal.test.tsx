import { fireEvent, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { QrCodeModalFactory } from '../../../src/short-urls/helpers/QrCodeModal';
import type { ImageDownloader } from '../../../src/utils/services/ImageDownloader';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<QrCodeModal />', () => {
  const saveImage = vi.fn().mockReturnValue(Promise.resolve());
  const QrCodeModal = QrCodeModalFactory(fromPartial({
    ImageDownloader: fromPartial<ImageDownloader>({ saveImage }),
  }));
  const shortUrl = 'https://s.test/abc123';
  const setUp = () => renderWithEvents(
    <QrCodeModal
      isOpen
      shortUrl={fromPartial({ shortUrl })}
      toggle={() => {}}
    />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows an external link to the URL in the header', () => {
    setUp();
    const externalLink = screen.getByRole('heading').querySelector('a');

    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute('href', shortUrl);
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays an image with the QR code of the URL', async () => {
    setUp();

    const expectedUrl = `${shortUrl}/qr-code`;

    expect(screen.getByRole('img')).toHaveAttribute('src', expectedUrl);
    expect(screen.getByText(expectedUrl)).toHaveAttribute('href', expectedUrl);
  });

  it.each([
    [530, 0, 'lg'],
    [200, 0, undefined],
    [830, 0, 'xl'],
    [430, 80, 'lg'],
    [200, 50, undefined],
    [720, 100, 'xl'],
  ])('renders expected size', async (size, margin, modalSize) => {
    const { user } = setUp();

    // Switch to sliders
    await user.click(screen.getByRole('button', { name: 'Customize size' }));
    await user.click(screen.getByRole('button', { name: 'Customize margin' }));

    const [sizeInput, marginInput] = screen.getAllByRole('slider');
    if (!sizeInput || !marginInput) {
      throw new Error('Sliders not found');
    }

    fireEvent.change(sizeInput, { target: { value: `${size}` } });
    fireEvent.change(marginInput, { target: { value: `${margin}` } });

    expect(screen.getByText(`size: ${size}px`)).toBeInTheDocument();
    expect(screen.getByText(`margin: ${margin}px`)).toBeInTheDocument();

    // Fake the images load event with a width that matches the size+margin
    const image = screen.getByAltText('QR code');
    Object.defineProperty(image, 'naturalWidth', {
      get: () => size + margin,
    });
    image.dispatchEvent(new Event('load'));

    if (modalSize) {
      await waitFor(() => expect(screen.getByRole('document')).toHaveClass(`modal-${modalSize}`));
    }
  });

  it('shows expected buttons', () => {
    setUp();

    // Add three because of the close, download and copy-to-clipboard buttons
    expect(screen.getAllByRole('button')).toHaveLength(4 + 3);
  });

  it('saves the QR code image when clicking the Download button', async () => {
    const { user } = setUp();

    expect(saveImage).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /^Download/ }));
    expect(saveImage).toHaveBeenCalledOnce();
  });
});
