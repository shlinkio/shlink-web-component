import { buildQrCodeUrl } from '../../../src/utils/helpers/qrCodes';

describe('qrCodes', () => {
  describe('buildQrCodeUrl', () => {
    it.each([
      [
        'bar.io',
        { size: 870, format: 'svg' as const, errorCorrection: 'L' as const, margin: 0 },
        'bar.io/qr-code?size=870&format=svg&errorCorrection=L&margin=0',
      ],
      [
        'bar.io',
        { size: 200, format: 'svg' as const, errorCorrection: 'L' as const },
        'bar.io/qr-code?size=200&format=svg&errorCorrection=L',
      ],
      [
        'shlink.io',
        { size: 456, format: 'png' as const, errorCorrection: 'L' as const, margin: 10 },
        'shlink.io/qr-code?size=456&format=png&errorCorrection=L&margin=10',
      ],
      [
        'shlink.io',
        { size: 456, format: 'png' as const, errorCorrection: 'H' as const },
        'shlink.io/qr-code?size=456&format=png&errorCorrection=H',
      ],
      [
        'shlink.io',
        { size: 999, format: 'png' as const, errorCorrection: 'Q' as const, margin: 20 },
        'shlink.io/qr-code?size=999&format=png&errorCorrection=Q&margin=20',
      ],
    ])('builds expected URL based in params', (shortUrl, options, expectedUrl) => {
      expect(buildQrCodeUrl(shortUrl, options)).toEqual(expectedUrl);
    });
  });
});
