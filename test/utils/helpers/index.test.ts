import {
  humanFriendlyJoin,
  nonEmptyStringOrNull,
  parseBooleanToString,
  parseOptionalBooleanToString,
  rangeOf,
} from '../../../src/utils/helpers';

describe('helpers', () => {
  describe('rangeOf', () => {
    const func = (i: number) => `result_${i}`;
    const size = 5;

    it('builds a range of specified size invike provided function', () => {
      expect(rangeOf(size, func)).toEqual([
        'result_1',
        'result_2',
        'result_3',
        'result_4',
        'result_5',
      ]);
    });

    it('builds a range starting at provided pos', () => {
      const startAt = 3;

      expect(rangeOf(size, func, startAt)).toEqual([
        'result_3',
        'result_4',
        'result_5',
      ]);
    });
  });

  describe('nonEmptyStringOrNull', () => {
    it.each([
      ['', null],
      ['Hello', 'Hello'],
    ])('returns expected value based on input', (value, expected) => {
      expect(nonEmptyStringOrNull(value)).toEqual(expected);
    });
  });

  describe('parseBooleanToString', () => {
    it.each([
      [true, 'true'],
      [false, 'false'],
    ])('parses value as expected', (value, expectedResult) => {
      expect(parseBooleanToString(value)).toEqual(expectedResult);
    });
  });

  describe('parseOptionalBooleanToString', () => {
    it.each([
      [undefined, undefined],
      [true, 'true'],
      [false, 'false'],
    ])('parses value as expected', (value, expectedResult) => {
      expect(parseOptionalBooleanToString(value)).toEqual(expectedResult);
    });
  });

  describe('humanFriendlyJoin', () => {
    it.each([
      { list: ['a', 'b', 'c', 'd'], expectedResult: 'a, b, c and d' },
      { list: ['a', 'b'], expectedResult: 'a and b' },
      { list: ['a'], expectedResult: 'a' },
      { list: [], expectedResult: '' },
    ])('returns expected result', ({ list, expectedResult }) => {
      expect(humanFriendlyJoin(list)).toEqual(expectedResult);
    });
  });
});
