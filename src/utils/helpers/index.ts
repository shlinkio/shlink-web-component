import { range } from '@shlinkio/data-manipulation';
import { formatNumber } from '@shlinkio/shlink-frontend-kit';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

export type OptionalString = string | null | undefined;

export const rangeOf = <T>(size: number, mappingFn: (value: number) => T, startAt = 1): T[] =>
  range(startAt, size + 1).map(mappingFn);

export type Empty = null | undefined | '' | never[];

const isEmpty = (value: NonNullable<any>): boolean => (
  (Array.isArray(value) && value.length === 0)
  || (typeof value === 'string' && value === '')
  || (typeof value === 'object' && Object.keys(value).length === 0)
);

export const hasValue = <T>(value: T | Empty): value is T => value !== undefined && value !== null && !isEmpty(value);

export const nonEmptyStringOrNull = <T extends string>(value: T): T | null => (!value ? null : value);

export type BooleanString = 'true' | 'false';

export const parseBooleanToString = (value: boolean): BooleanString => (value ? 'true' : 'false');

export const parseOptionalBooleanToString = (value?: boolean): BooleanString | undefined => (
  value === undefined ? undefined : parseBooleanToString(value)
);

/**
 * Joins a list of strings separated by comma, with the "and" separator between the last two elements
 *
 * - ['a', 'b', 'c', 'd'] -> 'a, b, c and d'
 * - ['a', 'b'] -> 'a and b'
 * - ['a'] -> 'a'
 * - [] -> ''
 */
export const humanFriendlyJoin = (list: string[]): string => {
  if (list.length < 2) {
    return list[0] ?? '';
  }

  const [lastElement, ...rest] = list.reverse();
  return `${rest.reverse().join(', ')} and ${lastElement}`;
};

export const chartTooltipFormatter = (value?: ValueType): string | undefined =>
  typeof value === 'string' || typeof value === 'number' ? formatNumber(value) : undefined;
