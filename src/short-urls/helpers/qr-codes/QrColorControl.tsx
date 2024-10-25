import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FC } from 'react';
import type { ButtonProps } from 'reactstrap';
import { Button } from 'reactstrap';
import { ColorInput } from '../../../utils/components/ColorInput';

export type QrColorControlProps = {
  name: string;
  color?: string;
  /** Initial color to set when transitioning from default to custom */
  initialColor: string;
  onChange: (newColor?: string) => void;
};

const SubtleButton: FC<Omit<ButtonProps, 'outline' | 'color' | 'style'>> = (props) => (
  <Button
    outline
    color="link"
    style={{ color: 'var(--input-text-color)', borderColor: 'var(--border-color)' }}
    {...props}
  />
);

export const QrColorControl: FC<QrColorControlProps> = ({ name, color, initialColor, onChange }) => {
  return (
    <>
      {color === undefined ? (
        <SubtleButton
          className="text-start fst-italic w-100"
          onClick={() => onChange(initialColor)}
        >
          <span className="indivisible">Customize {name}</span>
        </SubtleButton>
      ) : (
        <div className="d-flex gap-1 w-100">
          <ColorInput color={color} onChange={onChange}/>
          <SubtleButton
            aria-label={`Default ${name}`}
            title={`Default ${name}`}
            onClick={() => onChange(undefined)}
          >
            <FontAwesomeIcon icon={faArrowRotateLeft}/>
          </SubtleButton>
        </div>
      )}
    </>
  );
};
