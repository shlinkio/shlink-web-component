import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { DropdownItem } from 'reactstrap';
import type { QrCodeFormat } from '../../../settings';

export const qrFormats: QrCodeFormat[] = ['png', 'svg', 'webp', 'jpeg'];

export type QrFormatDropdownProps = {
  format: QrCodeFormat;
  onChange: (format: QrCodeFormat) => void;
};

export const QrFormatDropdown: FC<QrFormatDropdownProps> = ({ format, onChange }) => (
  <DropdownBtn text={`Format (${format})`} dropdownClassName="tw:w-full">
    {qrFormats.map((f) => (
      <DropdownItem key={f} active={format === f} onClick={() => onChange(f)}>{f}</DropdownItem>
    ))}
  </DropdownBtn>
);
