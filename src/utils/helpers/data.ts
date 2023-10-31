// Functions brought from ramda while migrating away from it

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
export const splitEvery = <T>(list: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    chunks.push(list.slice(i, i + chunkSize));
  }

  return chunks;
};

/**
 * Returns a list of numbers from `from` (inclusive) to `to` (exclusive)
 */
export const range = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i);

/**
 * Group elements of an array based on provided function
 */
export const groupBy = <T, K extends string = string>(list: T[], fn: (a: T) => K): Record<K, T[]> => list.reduce(
  (acc, current) => {
    const key = fn(current);
    (acc[key] = acc[key] || []).push(current);
    return acc;
  },
  {} as Record<K, T[]>,
);

/**
 * Count elements of an array based on provided function
 */
export const countBy = <T>(list: T[], fn: (a: T) => string | number): Record<string, number> => list.reduce(
  (count, current) => {
    const key = fn(current);
    // eslint-disable-next-line no-param-reassign
    count[key] = (count[key] || 0) + 1;
    return count;
  },
  {} as Record<string, number>,
);

type Ord = number | string | boolean | Date;

/**
 * Sort an array by provided function
 */
export const sortBy = <T>(list: T[], fn: (a: T) => Ord): T[] => [...list].sort((a, b) => {
  const aKey = fn(a);
  const bKey = fn(b);
  if (aKey === bKey) {
    return 0;
  }
  return aKey < bKey ? -1 : 1;
});

const isObject = (item: any): boolean => item && typeof item === 'object' && !Array.isArray(item);

/**
 * Recursively merge two objects
 */
export const mergeDeepRight = <T extends Record<string, any>>(target: T, source: T): T => {
  const output: T = { ...target };
  if (!isObject(target) || !isObject(source)) {
    return output;
  }

  Object.keys(source).forEach((key: keyof T) => {
    if (isObject(source[key])) {
      output[key] = key in target ? mergeDeepRight(target[key], source[key]) : { ...source[key] };
    } else {
      output[key] = source[key];
    }
  });

  return output;
};
