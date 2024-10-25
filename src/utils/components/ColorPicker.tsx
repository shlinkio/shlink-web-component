import { faPalette as colorIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { Input } from 'reactstrap';

export type ColorPickerProps = {
  color: string;
  onChange: (newColor: string) => void;
  className?: string;
};

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(({ color, onChange, className }, ref) => (
  <div
    className={clsx('p-0 position-relative', className)}
    style={{ backgroundColor: color, borderColor: color }}
  >
    <FontAwesomeIcon
      icon={colorIcon}
      // Text color should be dynamically calculated to keep contrast
      className="position-absolute top-50 start-50 translate-middle text-white"
    />
    <Input
      className="form-control-color opacity-0"
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      innerRef={ref}
    />
  </div>
));
