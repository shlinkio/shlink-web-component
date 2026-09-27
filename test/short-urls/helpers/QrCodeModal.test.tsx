import { fromPartial } from '@total-typescript/shoehorn';
import { SettingsProvider } from '../../../src/settings';
import { QrCodeModal } from '../../../src/short-urls/helpers/QrCodeModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { setNativeInputValue } from '../../__helpers__/input';
import type { RenderWithEventsResult } from '../../__helpers__/setUpTest';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<QrCodeModal />', () => {
  const shortUrl = 'https://s.test/abc123';
  const setUp = () =>
    renderWithEvents(
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

  it('shows an external link to the URL in the header', async () => {
    const screen = await setUp();
    const externalLink = screen.getByRole('heading').element().querySelector('a');

    await expect.element(externalLink).toBeInTheDocument();
    await expect.element(externalLink).toHaveAttribute('href', shortUrl);
    await expect.element(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // FIXME Snapshots do not match when run in CI, because it generate some slightly off coordinates.
  //       I Need to investigate why.
  it.skipIf(import.meta.env.CI).each([
    { applyChanges: async () => {} },
    {
      // Setting size and margin
      applyChanges: async (screen: RenderWithEventsResult) => {
        const [sizeInput, marginInput] = screen.getByRole('slider').all();
        if (!sizeInput || !marginInput) {
          throw new Error('Sliders not found');
        }

        setNativeInputValue(sizeInput.element() as HTMLInputElement, '560');
        setNativeInputValue(marginInput.element() as HTMLInputElement, '20');
      },
    },
    {
      // Select error correction
      applyChanges: async ({ user, ...screen }: RenderWithEventsResult) => {
        await user.click(screen.getByRole('button', { name: /^Error correction/ }));
        await user.click(screen.getByRole('menuitem', { name: /uartile/ }));
      },
    },
    {
      // Set custom colors
      applyChanges: async (screen: RenderWithEventsResult) => {
        setNativeInputValue(screen.getByLabelText('color picker').element() as HTMLInputElement, '#ff0000');
        setNativeInputValue(screen.getByLabelText('background picker').element() as HTMLInputElement, '#0000ff');
      },
    },
    {
      // Set custom logo
      applyChanges: async ({ user, ...screen }: RenderWithEventsResult) => {
        const byteCharacters = atob(
          'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII',
        );
        const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const logo = new File([byteArray], 'logo.png', { type: 'image/svg' });

        await user.upload(screen.getByTestId('logo-input'), [logo]);
      },
    },
  ])('displays an image with expected configuration', async ({ applyChanges }) => {
    const { user, ...screen } = await setUp();

    await applyChanges({ user, ...screen });
    expect(screen.getByTestId('qr-code-container').element()).toMatchSnapshot();
  });

  it.each(['logo.png', 'some-image.svg', 'whatever.jpg'])('allows logo to be seat and cleared', async (logoName) => {
    const logo = new File([''], logoName, { type: 'image/svg' });
    const { user, ...screen } = await setUp();

    // At first, we can select a logo
    await expect.element(screen.getByRole('button', { name: 'Select logo' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: /^Clear logo/ })).not.toBeInTheDocument();

    await user.upload(screen.getByTestId('logo-input'), [logo]);

    // Once a logo has been selected, we can clear it
    await expect.element(screen.getByRole('button', { name: 'Select logo' })).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: /^Clear logo/ }))
      .toHaveTextContent(`Clear logo (${logoName})`);

    await user.click(screen.getByRole('button', { name: /^Clear logo/ }));

    // After clearing previous logo, we can select a new one
    await expect.element(screen.getByRole('button', { name: 'Select logo' })).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: /^Clear logo/ })).not.toBeInTheDocument();
  });

  // FIXME This test needs some investigation
  it.skip('saves the QR code image when clicking the Download button', async () => {
    const { user, ...screen } = await setUp();
    await user.click(screen.getByRole('button', { name: /^Download/ }));
  });

  it.each(['png', 'svg', 'jpeg', 'webp'])('copies the QR data URI when clicking the Copy button', async (format) => {
    const { user, ...screen } = await setUp();
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
      await expect
        .poll(() => writeText)
        .toHaveBeenCalledWith(expect.stringMatching(new RegExp(`^data:image/${format}`)));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
