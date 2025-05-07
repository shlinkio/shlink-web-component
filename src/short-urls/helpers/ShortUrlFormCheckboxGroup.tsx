import { Checkbox, Label } from '@shlinkio/shlink-frontend-kit/tailwind';
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
  <div className="tw:flex tw:items-center tw:gap-x-2">
    <Label className="tw:inline-flex tw:items-center tw:gap-x-1.5">
      <Checkbox checked={checked} onChange={onChange} />
      {children}
    </Label>
    <InfoTooltip placement="right">{infoTooltip}</InfoTooltip>
  </div>
);
