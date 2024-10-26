import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import { ColorInput } from '../../../utils/components/ColorInput';
import { SubtleButton } from '../../../utils/components/SubtleButton';

export type QrColorControlProps = {
  name: string;
  color?: string;
  /** Initial color to set when transitioning from default to custom */
  initialColor: string;
  onChange: (newColor?: string) => void;
};

export const QrColorControl: FC<QrColorControlProps> = ({ name, color, initialColor, onChange }) => (
  <>
    {color === undefined ? (
      <SubtleButton className="text-start fst-italic w-100" onClick={() => onChange(initialColor)}>
        <span className="indivisible">Customize {name}</span>
      </SubtleButton>
    ) : (
      <div className="d-flex gap-1 w-100">
        <ColorInput color={color} onChange={onChange} name={name} />
        <SubtleButton label={`Default ${name}`} onClick={() => onChange(undefined)}>
          <FontAwesomeIcon icon={faArrowRotateLeft} />
        </SubtleButton>
      </div>
    )}
  </>
);
