import type { RequiredReactNode, ToggleSwitchProps } from '@shlinkio/shlink-frontend-kit';
import { Label, ToggleSwitch } from '@shlinkio/shlink-frontend-kit';
import type { FC, PropsWithChildren } from 'react';
import { Muted } from '../../../utils/components/Muted';

export type LabelledToggleProps = ToggleSwitchProps & PropsWithChildren<{
  helpText?: RequiredReactNode;
  'data-testid'?: string
}>;

export const LabelledToggle: FC<LabelledToggleProps> = ({ children, helpText, 'data-testid': testId, ...rest }) => {
  return (
    <div data-testid={testId}>
      <Label className="flex items-center gap-x-2">
        <ToggleSwitch {...rest} />
        {children}
      </Label>
      {helpText && (
        <Muted size="sm" data-testid={testId ? `${testId}-help-text` : 'help-text'} className="pl-10">
          {helpText}
        </Muted>
      )}
    </div>
  );
};
