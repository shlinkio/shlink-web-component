import type { FC } from 'react';
import type { DateInputProps } from './DateInput';
import { DateInput } from './DateInput';

export type DateTimeInputProps = Omit<DateInputProps, 'type'>;

export const DateTimeInput: FC<DateTimeInputProps> = (props) => (
  <DateInput {...props} type="datetime" />
);
