import type { FC } from 'react';
import { DropdownBtn } from '../../../../shlink-frontend-kit/src';
import type { DateIntervalDropdownProps } from './DateIntervalDropdownItems';
import { DateIntervalDropdownItems } from './DateIntervalDropdownItems';
import { rangeOrIntervalToString } from './helpers/dateIntervals';

export const DateIntervalSelector: FC<DateIntervalDropdownProps> = ({ onChange, active, allText }) => (
  <DropdownBtn text={rangeOrIntervalToString(active) ?? allText}>
    <DateIntervalDropdownItems allText={allText} active={active} onChange={onChange} />
  </DropdownBtn>
);