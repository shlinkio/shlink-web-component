import { LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { QrCodeSettings } from '../../index';
import { defaultQrCodeSettings, useSetting } from '../../index';

export type QrCodeSizeSettingsProps = {
  onChange: (settings: QrCodeSettings) => void;
  className?: string;
};

export const QrCodeSizeSettings: FC<QrCodeSizeSettingsProps> = ({ onChange, className }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { size, margin } = qrCodesSettings;

  return (
    <SimpleCard title="Size" className={className} bodyClassName="tw:flex tw:flex-col tw:gap-4">
      <LabelledInput
        label="Default dimensions:"
        helpText={<>QR codes will be initially generated with <b data-testid="size">{size}x{size}px</b>.</>}
        type="range"
        value={size}
        step={10}
        min={50}
        max={1000}
        onChange={(e) => onChange({ ...qrCodesSettings, size: Number(e.target.value) })}
        inputClassName="tw:[&]:p-0"
      />

      <LabelledInput
        label="Default margin:"
        helpText={<>QR codes will be initially generated with a <b data-testid="margin">{margin}px</b> margin.</>}
        type="range"
        value={margin}
        step={1}
        min={0}
        max={100}
        onChange={(e) => onChange({ ...qrCodesSettings, margin: Number(e.target.value) })}
        inputClassName="tw:[&]:p-0"
      />
    </SimpleCard>
  );
};
