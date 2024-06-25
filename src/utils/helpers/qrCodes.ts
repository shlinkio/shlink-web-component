import { stringifyQuery } from '@shlinkio/shlink-frontend-kit';

export type QrCodeFormat = 'svg' | 'png';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeOptions {
  size: number|undefined;
  format: QrCodeFormat|undefined;
  margin: number|undefined;
  errorCorrection: QrErrorCorrection|undefined;
}

export const buildQrCodeUrl = (shortUrl: string, { margin, ...options }: QrCodeOptions): string => {
  const baseUrl = `${shortUrl}/qr-code`;
  const query = stringifyQuery({
    ...options,
    margin: (margin != undefined && margin > 0) ? margin : undefined,
  });

  return `${baseUrl}${!query ? '' : `?${query}`}`;
};
