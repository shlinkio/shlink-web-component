import {
  format,
  formatISO,
  isAfter,
  isBefore,
  isEqual,
  isWithinInterval,
  parse,
  parseISO as stdParseISO,
} from 'date-fns';

export const STANDARD_DATE_FORMAT = 'yyyy-MM-dd';

export const STANDARD_DATE_AND_TIME_FORMAT = 'yyyy-MM-dd HH:mm';

export type DateOrString = Date | string;

type NullableDate = DateOrString | null;

export const now = () => new Date();

export const isDateObject = (date: DateOrString): date is Date => typeof date !== 'string';

const formatDateFromFormat = (date?: NullableDate, theFormat?: string): string | null | undefined => {
  if (!date || !isDateObject(date)) {
    return date;
  }

  return theFormat ? format(date, theFormat) : formatISO(date);
};

export const formatIsoDate = (date?: NullableDate) => formatDateFromFormat(date, undefined);

export const formatInternational = (date?: NullableDate) => formatDateFromFormat(date, STANDARD_DATE_FORMAT);

export const formatHumanFriendly = (date?: NullableDate) => formatDateFromFormat(date, STANDARD_DATE_AND_TIME_FORMAT);

export const parseDate = (date: string, theFormat: string) => parse(date, theFormat, now());

export const parseISO = (date: DateOrString): Date => (isDateObject(date) ? date : stdParseISO(date));

export const isBetween = (date: DateOrString, start?: NullableDate, end?: NullableDate): boolean => {
  const parsedDate = parseISO(date);
  const parsedStart = start && parseISO(start);
  const parsedEnd = end && parseISO(end);

  if (parsedStart && parsedEnd) {
    try {
      return isWithinInterval(parsedDate, { start: parsedStart, end: parsedEnd });
    } catch (e) {
      return false;
    }
  }

  if (parsedStart) {
    return isEqual(parsedDate, parsedStart) || isAfter(parsedDate, parsedStart);
  }

  if (parsedEnd) {
    return isEqual(parsedDate, parsedEnd) || isBefore(parsedDate, parsedEnd);
  }

  return true;
};

export const isBeforeOrEqual = (date: Date | number, dateToCompare: Date | number) =>
  isEqual(date, dateToCompare) || isBefore(date, dateToCompare);
