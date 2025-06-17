import { Dropdown } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { DateRangeRow } from './DateRangeRow';
import type { DateInterval, DateRange } from './helpers/dateIntervals';
import {
  DATE_INTERVALS,
  intervalToDateRange,
  rangeIsInterval,
  rangeOrIntervalToString,
} from './helpers/dateIntervals';

export interface DateRangeSelectorProps {
  dateRangeOrInterval?: DateInterval | DateRange;

  /**
   * Invoked with a date range when specific start and/or end dates were selected.
   * If a date interval was selected instead, then invoked with the corresponding date range, and the date interval.
   */
  onDatesChange: (dateRange: DateRange, dateInterval?: DateInterval) => void;

  defaultText: string;
  disabled?: boolean;
}

export const DateRangeSelector = (
  { onDatesChange, dateRangeOrInterval, defaultText, disabled }: DateRangeSelectorProps,
) => {
  const text = useMemo(
    () => rangeOrIntervalToString(dateRangeOrInterval) ?? defaultText,
    [dateRangeOrInterval, defaultText],
  );
  const [activeDateRange, activeInterval] = useMemo((): [DateRange | undefined, DateInterval | undefined] => (
    rangeIsInterval(dateRangeOrInterval)
      ? [undefined, dateRangeOrInterval]
      : [dateRangeOrInterval, undefined]
  ), [dateRangeOrInterval]);

  const updateDateRangeOrInterval = useCallback((newDateRangeOrInterval: DateRange | DateInterval) => {
    if (rangeIsInterval(newDateRangeOrInterval)) {
      onDatesChange(intervalToDateRange(newDateRangeOrInterval), newDateRangeOrInterval);
    } else {
      onDatesChange(newDateRangeOrInterval);
    }
  }, [onDatesChange]);

  return (
    <Dropdown
      buttonDisabled={disabled}
      buttonContent={text}
      containerClassName="[&]:block"
      buttonClassName="w-full"
    >
      <Dropdown.Item selected={activeInterval === 'all'} onClick={() => updateDateRangeOrInterval('all')}>
        {defaultText}
      </Dropdown.Item>
      <Dropdown.Separator />
      {DATE_INTERVALS.map(
        (interval) => (
          <Dropdown.Item
            key={interval}
            selected={activeInterval === interval}
            onClick={() => updateDateRangeOrInterval(interval)}
          >
            {rangeOrIntervalToString(interval)}
          </Dropdown.Item>
        ),
      )}
      <Dropdown.Separator />
      <Dropdown.Misc>
        <DateRangeRow
          {...activeDateRange}
          onStartDateChange={(startDate) => updateDateRangeOrInterval({ ...activeDateRange, startDate })}
          onEndDateChange={(endDate) => updateDateRangeOrInterval({ ...activeDateRange, endDate })}
        />
      </Dropdown.Misc>
    </Dropdown>
  );
};
