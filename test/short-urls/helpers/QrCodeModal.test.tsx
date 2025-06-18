import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { SettingsProvider } from '../../../src/settings';
import { QrCodeModal } from '../../../src/short-urls/helpers/QrCodeModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<QrCodeModal />', () => {
  const shortUrl = 'https://s.test/abc123';
  const setUp = () => renderWithEvents(
    <SettingsProvider value={{}}>
      <QrCodeModal
        isOpen
        onClose={() => {}}
        shortUrl={fromPartial({ shortUrl })}
        qrDrawType="svg" // Render as SVG so that we can test certain functionalities via snapshots
      />
    </SettingsProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows an external link to the URL in the header', () => {
    setUp();
    const externalLink = screen.getByRole('heading').querySelector('a');

    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute('href', shortUrl);
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // FIXME Snapshots do not match when run in CI, because it generate some slightly off coordinates.
  //       I Need to investigate why.
  it.skipIf(import.meta.env.CI).each([
    { applyChanges: () => {} },
    {
      // Setting size and margin
      applyChanges: () => {
        const [sizeInput, marginInput] = screen.getAllByRole('slider');
        if (!sizeInput || !marginInput) {
          throw new Error('Sliders not found');
        }

        fireEvent.change(sizeInput, { target: { value: '560' } });
        fireEvent.change(marginInput, { target: { value: '20' } });
      },
    },
    {
      // Select error correction
      applyChanges: async (user: UserEvent) => {
        await user.click(screen.getByRole('button', { name: /^Error correction/ }));
        await user.click(screen.getByRole('menuitem', { name: /uartile/ }));
      },
    },
    {
      // Set custom colors
      applyChanges: () => {
        fireEvent.change(screen.getByLabelText('color picker'), { target: { value: '#ff0000' } });
        fireEvent.change(screen.getByLabelText('background picker'), { target: { value: '#0000ff' } });
      },
    },
    {
      // Set custom logo
      applyChanges: async (user: UserEvent) => {
        const byteCharacters = atob('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII');
        const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const logo = new File([byteArray], 'logo.png', { type: 'image/svg' });

        await user.upload(screen.getByTestId('logo-input'), [logo]);
      },
    },
  ])('displays an image with expected configuration', async ({ applyChanges }) => {
    const { user } = setUp();

    await applyChanges(user);
    expect(screen.getByTestId('qr-code-container')).toMatchSnapshot();
  });

  it.each([
    'logo.png',
    'some-image.svg',
    'whatever.jpg',
  ])('allows logo to be seat and cleared', async (logoName) => {
    const logo = new File([''], logoName, { type: 'image/svg' });
    const { user } = setUp();

    // At first, we can select a logo
    expect(screen.getByRole('button', { name: 'Select logo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Clear logo/ })).not.toBeInTheDocument();

    await user.upload(screen.getByTestId('logo-input'), [logo]);

    // Once a logo has been selected, we can clear it
    expect(screen.queryByRole('button', { name: 'Select logo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Clear logo/ })).toHaveTextContent(`Clear logo (${logoName})`);

    await user.click(screen.getByRole('button', { name: /^Clear logo/ }));

    // After clearing previous logo, we can select a new one
    expect(screen.getByRole('button', { name: 'Select logo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Clear logo/ })).not.toBeInTheDocument();
  });

  // FIXME This test needs some investigation
  it.skip('saves the QR code image when clicking the Download button', async () => {
    const { user } = setUp();
    await user.click(screen.getByRole('button', { name: /^Download/ }));
  });

  it.each([
    'png',
    'svg',
    'jpeg',
    'webp',
  ])('copies the QR data URI when clicking the Copy button', async (format) => {
    const { user } = setUp();
    const writeText = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    });

    try {
      // Select format in the dropdown
      await user.click(screen.getByRole('button', { name: /^Format/ }));
      await user.click(screen.getByRole('menuitem', { name: format }));
      // Copy to clipboard
      await user.click(screen.getByLabelText('Copy data URI'));
      await waitFor(
        () => expect(writeText).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`^data:image/${format}`))),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
