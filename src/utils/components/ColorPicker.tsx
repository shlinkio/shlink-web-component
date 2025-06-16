import { faPalette as colorIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input,isLightColor  } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { forwardRef } from 'react';

export type ColorPickerProps = {
  name: string;
  color: string;
  onChange: (newColor: string) => void;
  className?: string;
};

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ name, color, onChange, className }, ref) => (
    <div
      className={clsx('relative rounded w-12', className)}
      style={{ backgroundColor: color, borderColor: color }}
    >
      <Input
        className="w-full h-full cursor-pointer relative z-1 opacity-0"
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        ref={ref}
        name={name}
        aria-label={name.replace('-', ' ')}
      />
      <FontAwesomeIcon
        icon={colorIcon}
        className="absolute top-1/2 left-1/2 -translate-1/2"
        // Text color should be dynamically calculated to keep contrast
        style={{ color: isLightColor(color.substring(1)) ? '#000' : '#fff' }}
      />
    </div>
  ),
);
