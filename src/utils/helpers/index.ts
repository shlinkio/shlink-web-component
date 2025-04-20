import { range } from '@shlinkio/data-manipulation';
import type { SyntheticEvent } from 'react';
import { useCallback } from 'react';

export type OptionalString = string | null | undefined;

/**
 * Wraps an event handler so that it calls e.preventDefault() before invoking the event handler
 */
export const usePreventDefault = <Event extends SyntheticEvent = SyntheticEvent>(handler: (e: Event) => void) =>
  useCallback((e: Event) => {
    e.preventDefault();
    handler(e);
  }, [handler]);

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
