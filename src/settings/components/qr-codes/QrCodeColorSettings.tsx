import { LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { QrCodeSettings } from '../../index';
import { defaultQrCodeSettings, useSetting } from '../../index';

export type QrCodeColorSettingsProps = {
  onChange: (s: QrCodeSettings) => void;
  className?: string;
};

const colorInputClasses = 'tw:[&]:p-0 tw:[&]:md:w-1/4 tw:[&]:rounded-none';

export const QrCodeColorSettings: FC<QrCodeColorSettingsProps> = ({ onChange, className }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { color, bgColor } = qrCodesSettings;

  return (
    <SimpleCard title="Colors" className={className} bodyClassName="d-flex flex-column gap-3">
      <LabelledInput
        label="Default color:"
        helpText={<>QR codes will initially use <b data-testid="color">{color}</b> color.</>}
        type="color"
        value={color}
        onChange={(e) => onChange({ ...qrCodesSettings, color: e.target.value })}
        inputClassName={colorInputClasses}
      />

      <LabelledInput
        label="Default background color:"
        helpText={<>QR codes will initially use <b data-testid="bg-color">{bgColor}</b> background color.</>}
        type="color"
        value={bgColor}
        onChange={(e) => onChange({ ...qrCodesSettings, bgColor: e.target.value })}
        inputClassName={colorInputClasses}
      />
    </SimpleCard>
  );
};
