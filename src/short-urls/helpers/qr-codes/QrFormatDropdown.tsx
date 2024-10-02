import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { DropdownItem } from 'reactstrap';
import type { QrCodeFormat } from '../../../utils/helpers/qrCodes';

interface QrFormatDropdownProps {
  format?: QrCodeFormat;
  setFormat: (format?: QrCodeFormat) => void;
}

export const QrFormatDropdown: FC<QrFormatDropdownProps> = ({ format, setFormat }) => (
  <DropdownBtn text={format ? `Format (${format})` : <i>Default format</i>}>
    <DropdownItem active={!format} onClick={() => setFormat(undefined)}>Default</DropdownItem>
    <DropdownItem divider tag="hr" />
    <DropdownItem active={format === 'png'} onClick={() => setFormat('png')}>PNG</DropdownItem>
    <DropdownItem active={format === 'svg'} onClick={() => setFormat('svg')}>SVG</DropdownItem>
  </DropdownBtn>
);
