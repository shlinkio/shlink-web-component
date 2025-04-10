export type QrCodeFormat = 'svg' | 'png' | 'webp' | 'jpg';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type QrCodeOptions = {
  size?: number;
  format?: QrCodeFormat;
  margin?: number;
  errorCorrection?: QrErrorCorrection;
  color?: string;
  bgColor?: string;
};
