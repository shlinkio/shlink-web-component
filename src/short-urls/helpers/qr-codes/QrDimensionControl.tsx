import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useId } from 'react';
import { SubtleButton } from '../../../utils/components/SubtleButton';

export type QrCodeDimensionControlProps = {
  name: string;
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  initial?: number;
  onChange: (newValue?: number) => void;
};

export const QrDimensionControl: FC<QrCodeDimensionControlProps> = (
  { name, value, step, min, max, onChange, initial = min },
) => {
  const id = useId();

  return (
    <>
      {value === undefined ? (
        <SubtleButton className="text-start fst-italic w-100" onClick={() => onChange(initial)}>
          Customize {name}
        </SubtleButton>
      ) : (
        <div className="d-flex gap-1 w-100">
          <div className="d-flex flex-column flex-grow-1">
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
          <SubtleButton label={`Default ${name}`} onClick={() => onChange(undefined)}>
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </SubtleButton>
        </div>
      )}
    </>
  );
};
