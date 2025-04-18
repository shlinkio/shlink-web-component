import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useId } from 'react';
import type { QrCodeSettings } from '../../index';
import { defaultQrCodeSettings, useSetting } from '../../index';

export type QrCodeColorSettingsProps = {
  onChange: (s: QrCodeSettings) => void;
  className?: string;
};

export const QrCodeColorSettings: FC<QrCodeColorSettingsProps> = ({ onChange, className }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { color, bgColor } = qrCodesSettings;
  const colorId = useId();
  const bgColorId = useId();

  return (
    <SimpleCard title="Colors" className={className} bodyClassName="d-flex flex-column gap-3">
      <div className="d-flex flex-column gap-1">
        <label htmlFor={colorId}>Default color:</label>
        <input
          id={colorId}
          type="color"
          value={color}
          onChange={(e) => onChange({ ...qrCodesSettings, color: e.target.value })}
        />
        <small className="text-muted">
          QR codes will initially use <b data-testid="color">{color}</b> color.
        </small>
      </div>
      <div className="d-flex flex-column gap-1">
        <label htmlFor={bgColorId}>Default background color:</label>
        <input
          id={bgColorId}
          type="color"
          value={bgColor}
          onChange={(e) => onChange({ ...qrCodesSettings, bgColor: e.target.value })}
        />
        <small className="text-muted">
          QR codes will initially use <b data-testid="bg-color">{bgColor}</b> background color.
        </small>
      </div>
    </SimpleCard>
  );
};
