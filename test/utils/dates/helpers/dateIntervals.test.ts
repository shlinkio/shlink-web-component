import { endOfDay, format, formatISO, startOfDay, subDays } from 'date-fns';
import { now, parseDate } from '../../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../../src/utils/dates/helpers/dateIntervals';
import {
  calcPrevDateRange,
  dateRangeIsEmpty,
  dateToMatchingInterval,
  intervalToDateRange,
  isStrictDateRange,
  rangeIsInterval,
  rangeOrIntervalToString,
  toDateRange,
} from '../../../../src/utils/dates/helpers/dateIntervals';

describe('date-types', () => {
  const currentDate = now();
  const daysBack = (days: number) => subDays(currentDate, days);

  describe('dateRangeIsEmpty', () => {
    it.each([
      [undefined, true],
      [{}, true],
      [{ startDate: null }, true],
      [{ endDate: null }, true],
      [{ startDate: null, endDate: null }, true],
      [{ startDate: undefined }, true],
      [{ endDate: undefined }, true],
      [{ startDate: undefined, endDate: undefined }, true],
      [{ startDate: undefined, endDate: null }, true],
      [{ startDate: null, endDate: undefined }, true],
      [{ startDate: currentDate }, false],
      [{ endDate: currentDate }, false],
      [{ startDate: currentDate, endDate: currentDate }, false],
    ])('returns proper result', (dateRange, expectedResult) => {
      expect(dateRangeIsEmpty(dateRange)).toEqual(expectedResult);
    });
  });

  describe('rangeIsInterval', () => {
    it.each([
      [undefined, false],
      [{}, false],
      ['today' as DateInterval, true],
      ['yesterday' as DateInterval, true],
    ])('returns proper result', (range, expectedResult) => {
      expect(rangeIsInterval(range)).toEqual(expectedResult);
    });
  });

  describe('rangeOrIntervalToString', () => {
    it.each([
      [undefined, undefined],
      ['today' as DateInterval, 'Today'],
      ['yesterday' as DateInterval, 'Yesterday'],
      ['last7Days' as DateInterval, 'Last 7 days'],
      ['last30Days' as DateInterval, 'Last 30 days'],
      ['last90Days' as DateInterval, 'Last 90 days'],
      ['last180Days' as DateInterval, 'Last 180 days'],
      ['last365Days' as DateInterval, 'Last 365 days'],
      [{}, undefined],
      [{ startDate: null }, undefined],
      [{ endDate: null }, undefined],
      [{ startDate: null, endDate: null }, undefined],
      [{ startDate: undefined }, undefined],
      [{ endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: null }, undefined],
      [{ startDate: null, endDate: undefined }, undefined],
      [{ startDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Since 2020-01-01'],
      [{ endDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Until 2020-01-01'],
      [
        { startDate: parseDate('2020-01-01', 'yyyy-MM-dd'), endDate: parseDate('2021-02-02', 'yyyy-MM-dd') },
        '2020-01-01 - 2021-02-02',
      ],
    ])('returns proper result', (range, expectedValue) => {
      expect(rangeOrIntervalToString(range)).toEqual(expectedValue);
    });
  });

  describe('intervalToDateRange', () => {
    const formatted = (date?: Date | null): string | undefined => (!date ? undefined : format(date, 'yyyy-MM-dd'));

    it.each([
      [undefined, undefined, undefined],
      ['today' as const, currentDate, currentDate],
      ['yesterday' as const, daysBack(1), daysBack(1)],
      ['last7Days' as const, daysBack(7), currentDate],
      ['last30Days' as const, daysBack(30), currentDate],
      ['last90Days' as const, daysBack(90), currentDate],
      ['last180Days' as const, daysBack(180), currentDate],
      ['last365Days' as const, daysBack(365), currentDate],
    ])('returns proper result', (interval, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = intervalToDateRange(interval);

      expect(formatted(expectedStartDate)).toEqual(formatted(startDate));
      expect(formatted(expectedEndDate)).toEqual(formatted(endDate));
    });
  });

  describe('dateToMatchingInterval', () => {
    it.each([
      [startOfDay(currentDate), 'today'],
      [currentDate, 'today'],
      [formatISO(currentDate), 'today'],
      [daysBack(1), 'yesterday'],
      [endOfDay(daysBack(1)), 'yesterday'],
      [daysBack(2), 'last7Days'],
      [daysBack(7), 'last7Days'],
      [startOfDay(daysBack(7)), 'last7Days'],
      [daysBack(18), 'last30Days'],
      [daysBack(29), 'last30Days'],
      [daysBack(58), 'last90Days'],
      [startOfDay(daysBack(90)), 'last90Days'],
      [daysBack(120), 'last180Days'],
      [daysBack(250), 'last365Days'],
      [daysBack(366), 'all'],
      [formatISO(daysBack(500)), 'all'],
    ])('returns the first interval which contains provided date', (date, expectedInterval) => {
      expect(dateToMatchingInterval(date)).toEqual(expectedInterval);
    });
  });

  describe('toDateRange', () => {
    it.each([
      ['today' as const, intervalToDateRange('today')],
      ['yesterday' as const, intervalToDateRange('yesterday')],
      ['last7Days' as const, intervalToDateRange('last7Days')],
      ['last30Days' as const, intervalToDateRange('last30Days')],
      ['last90Days' as const, intervalToDateRange('last90Days')],
      ['last180Days' as const, intervalToDateRange('last180Days')],
      ['last365Days' as const, intervalToDateRange('last365Days')],
      ['all' as const, intervalToDateRange('all')],
      [{}, {}],
      [{ startDate: currentDate }, { startDate: currentDate }],
      [{ endDate: currentDate }, { endDate: currentDate }],
      [{ startDate: daysBack(10), endDate: currentDate }, { startDate: daysBack(10), endDate: currentDate }],
    ])('returns properly parsed interval or range', (rangeOrInterval, expectedResult) => {
      expect(toDateRange(rangeOrInterval)).toEqual(expectedResult);
    });
  });

  describe('isStrictDateRange', () => {
    it.each([
      [undefined, false],
      [{}, false],
      [{ startDate: null }, false],
      [{ endDate: null }, false],
      [{ startDate: null, endDate: null }, false],
      [{ startDate: new Date() }, false],
      [{ endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: null }, false],
      [{ startDate: null, endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: new Date() }, true],
    ])('returns true for strict date ranges', (dateRange, isStrict) => {
      expect(isStrictDateRange(dateRange)).toEqual(isStrict);
    });
  });

  describe('calcPrevDateRange', () => {
    it.each([
      [
        { startDate: new Date('2024-01-10 00:00:00'), endDate: new Date('2024-01-18 23:59:59') },
        '2024-01-01 00:00:00',
        '2024-01-09 23:59:59',
      ],
      [
        { startDate: new Date('2024-01-18'), endDate: new Date('2024-01-18') },
        '2024-01-17 00:00:00',
        '2024-01-17 23:59:59',
      ],
      [
        { startDate: new Date('2024-02-27 23:00:00'), endDate: new Date('2024-05-02 01:00:00') },
        '2023-12-23 00:00:00',
        '2024-02-26 23:59:59',
      ],
    ])('calculates previous date range', (dateRange, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = calcPrevDateRange(dateRange);

      expect(format(startDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedStartDate);
      expect(format(endDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedEndDate);
    });
  });
});
