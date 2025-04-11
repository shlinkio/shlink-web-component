import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { DropdownItem } from 'reactstrap';
import type { QrErrorCorrection } from '../../../utils/helpers/qrCodes';

interface QrErrorCorrectionDropdownProps {
  errorCorrection: QrErrorCorrection;
  onChange: (errorCorrection: QrErrorCorrection) => void;
}

export const QrErrorCorrectionDropdown: FC<QrErrorCorrectionDropdownProps> = ({ errorCorrection, onChange }) => (
  <DropdownBtn
    text={errorCorrection ? `Error correction (${errorCorrection})` : <i>Default error correction</i>}
    dropdownClassName="w-100"
  >
    <DropdownItem active={errorCorrection === 'L'} onClick={() => onChange('L')}>
      <b>L</b>ow
    </DropdownItem>
    <DropdownItem active={errorCorrection === 'M'} onClick={() => onChange('M')}>
      <b>M</b>edium
    </DropdownItem>
    <DropdownItem active={errorCorrection === 'Q'} onClick={() => onChange('Q')}>
      <b>Q</b>uartile
    </DropdownItem>
    <DropdownItem active={errorCorrection === 'H'} onClick={() => onChange('H')}>
      <b>H</b>igh
    </DropdownItem>
  </DropdownBtn>
);
