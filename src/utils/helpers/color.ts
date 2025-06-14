import { rangeOf } from './index';

const HEX_COLOR_LENGTH = 6;
const HEX_DIGITS = '0123456789ABCDEF';

export function buildRandomColor(): string {
  return `#${rangeOf(HEX_COLOR_LENGTH, () => HEX_DIGITS[Math.floor(Math.random() * HEX_DIGITS.length)]).join('')}`;
}
