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
    <div className="d-flex flex-column gap-1">
      <label htmlFor={id} className="text-capitalize">{name}: {value}px</label>
      <input
        id={id}
        type="range"
        className="form-control-range"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};
