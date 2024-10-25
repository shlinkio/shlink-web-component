import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { Input, InputGroup } from 'reactstrap';
import type { ColorPickerProps } from './ColorPicker';
import { ColorPicker } from './ColorPicker';

export const ColorInput: FC<Omit<ColorPickerProps, 'className'>> = ({ color, onChange }) => {
  const colorPickerRef = useElementRef<HTMLInputElement>();

  return (
    <InputGroup>
      <ColorPicker color={color} onChange={onChange} className="input-group-text" ref={colorPickerRef} />
      <Input value={color} readOnly onClick={() => colorPickerRef.current?.click()} />
    </InputGroup>
  );
};
