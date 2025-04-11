import type { DrawType, ErrorCorrectionLevel, FileExtension } from 'qr-code-styling';

export type QrCodeFormat = FileExtension;

export const qrFormats: QrCodeFormat[] = ['png', 'svg', 'webp', 'jpeg'];

export type QrErrorCorrection = ErrorCorrectionLevel;

export type QrDrawType = DrawType;

export type QrCodeOptions = {
  size?: number;
  format?: QrCodeFormat;
  margin?: number;
  errorCorrection?: QrErrorCorrection;
  color?: string;
  bgColor?: string;
};
