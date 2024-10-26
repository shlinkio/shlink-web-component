import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { DropdownItem } from 'reactstrap';
import type { QrCodeFormat } from '../../../utils/helpers/qrCodes';

interface QrFormatDropdownProps {
  format?: QrCodeFormat;
  onChange: (format?: QrCodeFormat) => void;
}

export const QrFormatDropdown: FC<QrFormatDropdownProps> = ({ format, onChange }) => (
  <DropdownBtn text={format ? `Format (${format})` : <i>Default format</i>} dropdownClassName="w-100">
    <DropdownItem active={!format} onClick={() => onChange(undefined)}>Default</DropdownItem>
    <DropdownItem divider tag="hr" />
    <DropdownItem active={format === 'png'} onClick={() => onChange('png')}>PNG</DropdownItem>
    <DropdownItem active={format === 'svg'} onClick={() => onChange('svg')}>SVG</DropdownItem>
  </DropdownBtn>
);
