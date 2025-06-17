import type { FC } from 'react';
import { useId } from 'react';

export type QrCodeDimensionControlProps = {
  name: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
};

export const QrDimensionControl: FC<QrCodeDimensionControlProps> = (
  { name, value, step, min, max, onChange },
) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="capitalize">{name}: {value}px</label>
      <input
        id={id}
        type="range"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
