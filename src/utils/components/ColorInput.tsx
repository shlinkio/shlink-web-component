import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Input, InputGroup } from 'reactstrap';
import type { ColorPickerProps } from './ColorPicker';
import { ColorPicker } from './ColorPicker';

export type ColorInputProps = Omit<ColorPickerProps, 'className'> & {
  name: string;
};

export const ColorInput: FC<ColorInputProps> = ({ color, onChange, name }) => {
  const colorPickerRef = useElementRef<HTMLInputElement>();

  return (
    <InputGroup>
      <ColorPicker name={name} color={color} onChange={onChange} className="input-group-text" ref={colorPickerRef} />
      <Input value={color} readOnly onClick={() => colorPickerRef.current?.click()} />
    </InputGroup>
  );
};
