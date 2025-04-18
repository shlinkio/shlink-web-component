import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
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
    <SimpleCard title="Format" bodyClassName="d-flex flex-column gap-3">
      <div className="d-flex flex-column gap-1">
        <QrFormatDropdown
          format={format}
          onChange={(format) => onChange({ ...qrCodesSettings, format })}
        />
        <small className="text-muted">
          When downloading a QR code, it will use <b>{format}</b> format by default.
        </small>
      </div>
      <div className="d-flex flex-column gap-1">
        <QrErrorCorrectionDropdown
          errorCorrection={errorCorrection}
          onChange={(errorCorrection) => onChange({ ...qrCodesSettings, errorCorrection })}
        />
        <small className="text-muted">
          QR codes will initially have a <b>{errorCorrection}</b> error correction.
        </small>
      </div>
    </SimpleCard>
  );
};
