import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useId } from 'react';
import type { QrCodeSettings } from '../../index';
import { defaultQrCodeSettings, useSetting } from '../../index';

export type QrCodeSizeSettingsProps = {
  onChange: (settings: QrCodeSettings) => void;
  className?: string;
};

export const QrCodeSizeSettings: FC<QrCodeSizeSettingsProps> = ({ onChange, className }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { size, margin } = qrCodesSettings;
  const sizeId = useId();
  const marginId = useId();

  return (
    <SimpleCard title="Size" className={className} bodyClassName="d-flex flex-column gap-3">
      <div className="d-flex flex-column gap-1">
        <label htmlFor={sizeId}>Default dimensions:</label>
        <input
          id={sizeId}
          type="range"
          value={size}
          step={10}
          min={50}
          max={1000}
          onChange={(e) => onChange({ ...qrCodesSettings, size: Number(e.target.value) })}
        />
        <small className="text-muted d-block">
          QR codes will be initially generated with <b>{size}x{size}px</b>.
        </small>
      </div>
      <div className="d-flex flex-column gap-1">
        <label htmlFor={marginId}>Default margin:</label>
        <input
          id={marginId}
          type="range"
          value={margin}
          step={1}
          min={0}
          max={100}
          onChange={(e) => onChange({ ...qrCodesSettings, margin: Number(e.target.value) })}
        />
        <small className="text-muted d-block">
          QR codes will be initially generated with a <b>{margin}px</b> margin.
        </small>
      </div>
    </SimpleCard>
  );
};
