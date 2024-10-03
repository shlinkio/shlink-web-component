import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { useId } from 'react';
import { Button, FormGroup } from 'reactstrap';

export type QrCodeDimensionControlProps = {
  name: string;
  value?: number;
  step: number;
  min: number;
  max: number;
  initial?: number;
  onChange: (newValue?: number) => void;
  className?: string;
};

export const QrCodeDimensionControl: FC<QrCodeDimensionControlProps> = (
  { name, value, step, min, max, onChange, className, initial = min },
) => {
  const id = useId();

  return (
    <FormGroup className={className}>
      {value === undefined && (
        <Button
          outline
          color="link"
          className="text-start fst-italic w-100"
          style={{ color: 'var(--input-text-color)', borderColor: 'var(--border-color)' }}
          onClick={() => onChange(initial)}
        >
          Customize {name}
        </Button>
      )}
      {value !== undefined && (
        <div className="d-flex gap-3">
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
          <Button
            aria-label={`Default ${name}`}
            title={`Default ${name}`}
            outline
            color="link"
            onClick={() => onChange(undefined)}
            style={{ color: 'var(--input-text-color)', borderColor: 'var(--border-color)' }}
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} />
          </Button>
        </div>
      )}
    </FormGroup>
  );
};
