const formatter = new Intl.NumberFormat('en-US');

export const prettify = (number: number | string) => formatter.format(Number(number));

const TEN_ROUNDING_NUMBER = 10;

export const roundTen = (number: number) => Math.ceil(number / TEN_ROUNDING_NUMBER) * TEN_ROUNDING_NUMBER;
