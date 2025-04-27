import { SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { QrErrorCorrectionDropdown } from '../../../short-urls/helpers/qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from '../../../short-urls/helpers/qr-codes/QrFormatDropdown';
import { defaultQrCodeSettings, useSetting } from '../../index';
import type { QrCodeSettings } from '../../types';

export type QrCodeFormatSettingsProps = {
  onChange: (s: QrCodeSettings) => void;
};

export const QrCodeFormatSettings: FC<QrCodeFormatSettingsProps> = ({ onChange }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { format, errorCorrection } = qrCodesSettings;

  return (
    <SimpleCard title="Format" className="card" bodyClassName="tw:flex tw:flex-col tw:gap-4">
      <div className="tw:flex tw:flex-col tw:gap-1">
        <QrFormatDropdown
          format={format}
          onChange={(format) => onChange({ ...qrCodesSettings, format })}
        />
        <small className="tw:text-gray-500 tw:dark:text-gray-400">
          When downloading a QR code, it will use <b data-testid="format">{format}</b> format by default.
        </small>
      </div>
      <div className="tw:flex tw:flex-col tw:gap-1">
        <QrErrorCorrectionDropdown
          errorCorrection={errorCorrection}
          onChange={(errorCorrection) => onChange({ ...qrCodesSettings, errorCorrection })}
        />
        <small className="tw:text-gray-500 tw:dark:text-gray-400">
          QR codes will initially have a <b data-testid="error-correction">{errorCorrection}</b> error correction.
        </small>
      </div>
    </SimpleCard>
  );
};
