import { Checkbox, Label } from '@shlinkio/shlink-frontend-kit';
import type { ChangeEvent, FC, PropsWithChildren } from 'react';
import { InfoTooltip } from '../../utils/components/InfoTooltip';

export type ShortUrlFormCheckboxGroupProps = PropsWithChildren<{
  checked?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  infoTooltip: string;
}>;

export const ShortUrlFormCheckboxGroup: FC<ShortUrlFormCheckboxGroupProps> = (
  { children, infoTooltip, checked, onChange },
) => (
  <div className="flex items-center gap-x-2">
    <Label className="inline-flex items-center gap-x-1.5">
      <Checkbox checked={checked} onChange={onChange} />
      {children}
    </Label>
    <InfoTooltip placement="right">{infoTooltip}</InfoTooltip>
  </div>
);
