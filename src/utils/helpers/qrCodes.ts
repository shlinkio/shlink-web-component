import type { DrawType } from 'qr-code-styling';
import type { QrCodeFormat } from '../../settings';

export const qrFormats: QrCodeFormat[] = ['png', 'svg', 'webp', 'jpeg'];

export type QrDrawType = DrawType;
