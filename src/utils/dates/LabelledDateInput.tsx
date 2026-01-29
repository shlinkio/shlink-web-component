import { clsx } from 'clsx';
import type { FC } from 'react';
import { useId } from 'react';
import type { DateInputProps } from './DateInput';
import { DateInput } from './DateInput';

export type LabelledDateInputProps = DateInputProps & {
  label: string;
  /** Do not render a space between the label and input. Defaults to false */
  spaceless?: boolean;
};

export const LabelledDateInput: FC<LabelledDateInputProps> = ({ label, id, spaceless, ...rest }) => {
  const inputId = useId();
  return (
    <>
      <label htmlFor={id ?? inputId} className={clsx(!spaceless && 'mb-1')}>{label}:</label>
      <DateInput id={id ?? inputId} {...rest} />
    </>
  );
};
