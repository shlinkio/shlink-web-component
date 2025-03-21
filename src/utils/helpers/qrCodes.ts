import { stringifyQueryParams } from '@shlinkio/shlink-frontend-kit';

export type QrCodeFormat = 'svg' | 'png' | 'webp';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type QrCodeOptions = {
  size?: number;
  format?: QrCodeFormat;
  margin?: number;
  errorCorrection?: QrErrorCorrection;
  color?: string;
  bgColor?: string;
};

const normalizeColor = (color?: string) => color && color.startsWith('#') ? color.substring(1) : color;

export const buildQrCodeUrl = (shortUrl: string, { color, bgColor, ...rest }: QrCodeOptions): string => {
  const baseUrl = `${shortUrl}/qr-code`;
  const query = stringifyQueryParams({ ...rest, color: normalizeColor(color), bgColor: normalizeColor(bgColor) });

  return `${baseUrl}${!query ? '' : `?${query}`}`;
};
