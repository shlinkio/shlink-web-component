import { faPalette as colorIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input } from '@shlinkio/shlink-frontend-kit/tailwind';
import { clsx } from 'clsx';
import { forwardRef } from 'react';
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
      className={clsx('tw:relative tw:rounded tw:w-10', className)}
      style={{ backgroundColor: color, borderColor: color }}
    >
      <Input
        className="tw:w-full tw:h-full tw:cursor-pointer tw:relative tw:z-1 tw:opacity-0"
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        ref={ref}
        name={name}
        aria-label={name.replace('-', ' ')}
      />
      <FontAwesomeIcon
        icon={colorIcon}
        className="tw:absolute tw:top-1/2 tw:left-1/2 tw:-translate-1/2"
        // Text color should be dynamically calculated to keep contrast
        style={{ color: isLightColor(color.substring(1)) ? '#000' : '#fff' }}
      />
    </div>
  ),
);
