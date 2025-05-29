import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { clsx } from 'clsx';
import type { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { UnstyledButton } from '../../utils/components/UnstyledButton';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';

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

export const Tag: FC<TagProps> = (props) => {
  const { text, children, className, colorGenerator } = props;
  const actionable = isActionable(props);
  const clearable = isClearable(props);
  const Wrapper = actionable ? UnstyledButton : 'span';
  const style = useMemo(() => colorGenerator.stylesForKey(text), [text, colorGenerator]);

  return (
    <Wrapper
      className={clsx(
        'tw:inline-flex tw:items-center tw:gap-1',
        'tw:font-bold tw:[&]:rounded-md',
        {
          'tw:text-sm tw:px-1.5 tw:py-0.5': !clearable,
          'tw:py-1 tw:px-2': clearable,
          'tw:cursor-pointer': actionable,
        },
        className,
      )}
      style={style}
      onClick={actionable ? props.onClick : undefined}
      data-testid="tag"
    >
      {children ?? text}
      {clearable && (
        <UnstyledButton
          aria-label={`Remove ${text}`}
          className="tw:p-0 tw:text-lg tw:leading-5.5"
          onClick={props.onClose}
        >
          <FontAwesomeIcon icon={faClose} size="sm" />
        </UnstyledButton>
      )}
    </Wrapper>
  );
};
