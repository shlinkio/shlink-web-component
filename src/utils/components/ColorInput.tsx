import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Input, InputGroup } from 'reactstrap';
import type { ColorPickerProps } from './ColorPicker';
import { ColorPicker } from './ColorPicker';

export const ColorInput: FC<Omit<ColorPickerProps, 'className'>> = ({ color, onChange, name }) => {
  const colorPickerRef = useElementRef<HTMLInputElement>();

  return (
    <InputGroup>
      <ColorPicker
        name={`${name}-picker`}
        color={color}
        onChange={onChange}
        className="input-group-text"
        ref={colorPickerRef}
      />
      <Input
        readOnly
        value={color}
        onClick={() => colorPickerRef.current?.click()}
        aria-label={name}
        data-testid="text-input"
      />
    </InputGroup>
  );
};
