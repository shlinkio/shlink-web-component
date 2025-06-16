import type { InputProps } from '@shlinkio/shlink-frontend-kit';
import { Input } from '@shlinkio/shlink-frontend-kit';
import type { ChangeEvent, FC } from 'react';
import { useCallback, useMemo } from 'react';
import { formatHumanFriendly, formatInternational, parseISO } from './helpers/date';

type FilteredInputProps = Omit<InputProps, 'onChange' | 'value' | 'type' | 'min' | 'max' | 'onFocus'>;

export type DateInputProps = FilteredInputProps & {
  minDate?: Date;
  maxDate?: Date;
  value?: Date | null;
  onChange?: (newDate: Date | null) => void;
  withTime?: boolean
};

export const DateInput: FC<DateInputProps> = (
  { minDate, maxDate, value, onChange, withTime = false, ...rest },
) => {
  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      // When setting an empty value, immediately clear selected date
      if (!target.value) {
        onChange?.(null);
        return;
      }

      /* TODO Allow doing some debounce */
      onChange?.(parseISO(target.value));
    },
    [onChange],
  );
  const formatter = useMemo(() => (withTime ? formatHumanFriendly : formatInternational), [withTime]);

  return (
    <Input
      {...rest}
      type={withTime ? 'datetime-local' : 'date'}
      value={formatter(value) ?? ''}
      max={formatter(maxDate) ?? undefined}
      min={formatter(minDate) ?? undefined}
      onChange={handleChange}
    />
  );
};
