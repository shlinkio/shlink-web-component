import { stringifyQueryParams } from '@shlinkio/shlink-frontend-kit';

export type QrCodeFormat = 'svg' | 'png';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeOptions {
  size?: number;
  format?: QrCodeFormat;
  margin?: number;
  errorCorrection?: QrErrorCorrection;
}

export const buildQrCodeUrl = (shortUrl: string, options: QrCodeOptions): string => {
  const baseUrl = `${shortUrl}/qr-code`;
  const query = stringifyQueryParams({ ...options });

  return `${baseUrl}${!query ? '' : `?${query}`}`;
};
