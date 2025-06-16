import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { QrErrorCorrection } from '../../../settings';

interface QrErrorCorrectionDropdownProps {
  errorCorrection: QrErrorCorrection;
  onChange: (errorCorrection: QrErrorCorrection) => void;
}

export const QrErrorCorrectionDropdown: FC<QrErrorCorrectionDropdownProps> = ({ errorCorrection, onChange }) => (
  <Dropdown
    buttonContent={errorCorrection ? `Error correction (${errorCorrection})` : <i>Default error correction</i>}
    buttonClassName="w-full"
  >
    <Dropdown.Item selected={errorCorrection === 'L'} onClick={() => onChange('L')}>
      <b>L</b>ow
    </Dropdown.Item>
    <Dropdown.Item selected={errorCorrection === 'M'} onClick={() => onChange('M')}>
      <b>M</b>edium
    </Dropdown.Item>
    <Dropdown.Item selected={errorCorrection === 'Q'} onClick={() => onChange('Q')}>
      <b>Q</b>uartile
    </Dropdown.Item>
    <Dropdown.Item selected={errorCorrection === 'H'} onClick={() => onChange('H')}>
      <b>H</b>igh
    </Dropdown.Item>
  </Dropdown>
);
