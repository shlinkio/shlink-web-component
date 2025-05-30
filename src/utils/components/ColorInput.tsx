import { Input } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useRef } from 'react';
import type { ColorPickerProps } from './ColorPicker';
import { ColorPicker } from './ColorPicker';

export const ColorInput: FC<Omit<ColorPickerProps, 'className'>> = ({ color, onChange, name }) => {
  const colorPickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="tw:flex">
      <ColorPicker
        name={`${name}-picker`}
        color={color}
        onChange={onChange}
        className="tw:rounded-r-none"
        ref={colorPickerRef}
      />
      <Input
        readOnly
        value={color}
        onClick={() => colorPickerRef.current?.click()}
        aria-label={name}
        data-testid="text-input"
        className="tw:grow tw:rounded-l-none"
      />
    </div>
  );
};
