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
      <Label className="tw:flex tw:items-center tw:gap-x-1.5">
        <ToggleSwitch {...rest} />
        {children}
      </Label>
      {helpText && <FormText data-testid={`${testId}-help-text`} className="tw:pl-9.5">{helpText}</FormText>}
    </div>
  );
};
