import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { QrCodeFormat } from '../../../settings';

export const qrFormats: QrCodeFormat[] = ['png', 'svg', 'webp', 'jpeg'];

export type QrFormatDropdownProps = {
  format: QrCodeFormat;
  onChange: (format: QrCodeFormat) => void;
};

export const QrFormatDropdown: FC<QrFormatDropdownProps> = ({ format, onChange }) => (
  <Dropdown buttonContent={`Format (${format})`} buttonClassName="w-full">
    {qrFormats.map((f) => (
      <Dropdown.Item key={f} selected={format === f} onClick={() => onChange(f)}>{f}</Dropdown.Item>
    ))}
  </Dropdown>
);
