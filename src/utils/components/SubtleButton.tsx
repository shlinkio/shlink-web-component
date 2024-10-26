import type { FC } from 'react';
import type { ButtonProps } from 'reactstrap';
import { Button } from 'reactstrap';

export type SubtleButtonProps = Omit<ButtonProps, 'outline' | 'color' | 'style'> & {
  /**
   * Used to set both `aria-label` and `title` props if provided.
   * You can still provide any of those props explicitly, and they will take precedence.
   */
  label?: string;
};

export const SubtleButton: FC<SubtleButtonProps> = ({ label, ...rest }) => (
  <Button
    outline
    color="link"
    style={{ color: 'var(--input-text-color)', borderColor: 'var(--border-color)' }}
    aria-label={label}
    title={label}
    {...rest}
  />
);
