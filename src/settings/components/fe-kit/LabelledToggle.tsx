import type { RequiredReactNode, ToggleSwitchProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { Label, ToggleSwitch } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, PropsWithChildren } from 'react';
import { FormText } from '../FormText';

export type LabelledToggleProps = ToggleSwitchProps & PropsWithChildren<{
  helpText?: RequiredReactNode;
  'data-testid'?: string
}>;

export const LabelledToggle: FC<LabelledToggleProps> = ({ children, helpText, 'data-testid': testId, ...rest }) => {
  return (
    <div data-testid={testId}>
      <Label className="tw:flex tw:items-center tw:gap-x-2">
        <ToggleSwitch {...rest} />
        {children}
      </Label>
      {helpText && (
        <FormText data-testid={testId ? `${testId}-help-text` : 'help-text'} className="tw:pl-10">{helpText}</FormText>
      )}
    </div>
  );
};
