import { faPalette as colorIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
import { Input } from 'reactstrap';
import { isLightColor } from '../helpers/color';

export type ColorPickerProps = {
  name: string;
  color: string;
  onChange: (newColor: string) => void;
  className?: string;
};

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ name, color, onChange, className }, ref) => (
    <div
      className={clsx('p-0 position-relative', className)}
      style={{ backgroundColor: color, borderColor: color }}
    >
      <FontAwesomeIcon
        icon={colorIcon}
        className="position-absolute top-50 start-50 translate-middle"
        // Text color should be dynamically calculated to keep contrast
        style={{ color: isLightColor(color.substring(1)) ? '#000' : '#fff' }}
      />
      <Input
        className="form-control-color opacity-0"
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        innerRef={ref}
        name={name}
        aria-label={name.replace('-', ' ')}
      />
    </div>
  ),
);
