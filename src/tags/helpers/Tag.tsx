import classNames from 'classnames';
import type { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { UnstyledButton } from '../../utils/components/UnstyledButton';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import './Tag.scss';

type CommonProps = PropsWithChildren<{
  colorGenerator: ColorGenerator;
  text: string;
  className?: string;
}>;

type ClearableProps = CommonProps & { onClose?: MouseEventHandler; onClick?: never; };

type ActionableProps = CommonProps & { onClick?: MouseEventHandler; onClose?: never; };

type TagProps = ClearableProps | ActionableProps;

const isClearable = (props: TagProps): props is ClearableProps => !!(props as ClearableProps).onClose;
const isActionable = (props: TagProps): props is ActionableProps => !!(props as ActionableProps).onClick;

/* eslint-disable react/destructuring-assignment */
export const Tag: FC<TagProps> = (props) => {
  const { text, children, className, colorGenerator } = props;
  const actionable = isActionable(props);
  const Wrapper = actionable ? UnstyledButton : 'span';
  const isLightColor = useMemo(() => colorGenerator.isColorLightForKey(text), [text, colorGenerator]);

  return (
    <Wrapper
      className={classNames('badge tag', className, { 'tag--light-bg': isLightColor, pointer: actionable })}
      style={{ backgroundColor: colorGenerator.getColorForKey(text) }}
      onClick={actionable ? props.onClick : undefined}
    >
      {children ?? text}
      {isClearable(props) && (
        <UnstyledButton
          aria-label={`Remove ${text}`}
          className={classNames('bg-transparent ms-1 opacity-100 p-0 fw-bold tag__close', {
            'tag--light-bg': isLightColor,
          })}
          onClick={props.onClose}
        >&times;
        </UnstyledButton>
      )}
    </Wrapper>
  );
};
