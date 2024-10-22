import { screen } from '@testing-library/react';
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
