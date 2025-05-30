import type { FC } from 'react';
import { useId } from 'react';
import type { DateInputProps } from './DateInput';
import { DateInput } from './DateInput';

export type LabelledDateInputProps = DateInputProps & { label: string };

export const LabelledDateInput: FC<LabelledDateInputProps> = ({ label, id, ...rest }) => {
  const inputId = useId();
  return (
    <>
      <label htmlFor={id ?? inputId} className="tw:mb-1">{label}:</label>
      <DateInput id={id ?? inputId} {...rest} />
    </>
  );
};
