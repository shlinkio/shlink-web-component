import { endOfDay } from 'date-fns';
import type { FC } from 'react';
import type { DateRange } from './helpers/dateIntervals';
import { LabelledDateInput } from './LabelledDateInput';

interface DateRangeRowProps extends DateRange {
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  disabled?: boolean;
}

export const DateRangeRow: FC<DateRangeRowProps> = (
  { startDate, endDate, disabled = false, onStartDateChange, onEndDateChange },
) => (
  <div className="row">
    <div className="col-md-6">
      <LabelledDateInput
        label="Since"
        value={startDate}
        maxDate={endDate ?? undefined}
        disabled={disabled}
        onChange={onStartDateChange}
      />
    </div>
    <div className="col-md-6 mt-3 mt-md-0">
      <LabelledDateInput
        label="Until"
        value={endDate}
        minDate={startDate ?? undefined}
        disabled={disabled}
        onChange={(date) => onEndDateChange(date && endOfDay(date))}
      />
    </div>
  </div>
);
