import * as R from 'ramda';

/**
 * Create an object from a list of keys and values
 */
export const zipObj = <T, K extends string>(keys: readonly K[], values: readonly T[]): { [P in K]: T } =>
  Object.fromEntries(
    keys.map((key, index) => [key, values[index]]),
  ) as { [P in K]: T };

/**
 * Split an array into chunks of a specific size
 */
export const splitEvery = <T>(arr: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }

  return chunks;
};

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive)
 */
export const range = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i);

export const { cond, T, always, countBy, groupBy, sortBy, mergeDeepRight } = R;
