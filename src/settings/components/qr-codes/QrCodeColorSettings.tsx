import { LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { QrCodeSettings } from '../../index';
import { defaultQrCodeSettings, useSetting } from '../../index';

export type QrCodeColorSettingsProps = {
  onChange: (s: QrCodeSettings) => void;
  className?: string;
};

const colorInputClasses = '[&]:p-0 [&]:md:w-1/4 [&]:rounded-none';

export const QrCodeColorSettings: FC<QrCodeColorSettingsProps> = ({ onChange, className }) => {
  const qrCodesSettings = useSetting('qrCodes', defaultQrCodeSettings);
  const { color, bgColor } = qrCodesSettings;

  return (
    <SimpleCard title="Colors" className={className} bodyClassName="flex flex-col gap-4">
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
