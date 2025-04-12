import { fireEvent, screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { QrCodeModal } from '../../../src/short-urls/helpers/QrCodeModal';
import { FeaturesProvider } from '../../../src/utils/features';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<QrCodeModal />', () => {
  const shortUrl = 'https://s.test/abc123';
  const setUp = ({ qrCodeColors = false }: { qrCodeColors?: boolean } = {}) => renderWithEvents(
    <FeaturesProvider value={fromPartial({ qrCodeColors })}>
      <QrCodeModal
        isOpen
        shortUrl={fromPartial({ shortUrl })}
        toggle={() => {}}
        qrDrawType="svg" // Render as SVG so that we can test certain functionalities via snapshots
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

  it.each([
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
  ])('displays an image with expected configuration', async ({ applyChanges }) => {
    const { user } = setUp({ qrCodeColors: true });

    await applyChanges(user);
    expect(screen.getByTestId('qr-code-container')).toMatchSnapshot();
  });

  it.each([
    { qrCodeColors: false },
    { qrCodeColors: true },
  ])('shows color controls only if feature is supported', ({ qrCodeColors }) => {
    setUp({ qrCodeColors });

    if (qrCodeColors) {
      expect(screen.getByLabelText('color')).toBeInTheDocument();
      expect(screen.getByLabelText('background')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('color')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('background')).not.toBeInTheDocument();
    }
  });

  // FIXME This test needs a real browser
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
