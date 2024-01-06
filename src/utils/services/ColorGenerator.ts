import type { CSSProperties } from 'react';
import { rangeOf } from '../helpers';
import type { TagColorsStorage } from './TagColorsStorage';

const HEX_COLOR_LENGTH = 6;
const HEX_DIGITS = '0123456789ABCDEF';
const LIGHTNESS_BREAKPOINT = 128;

const { floor, random, sqrt, round } = Math;
const buildRandomColor = () =>
  `#${rangeOf(HEX_COLOR_LENGTH, () => HEX_DIGITS[floor(random() * HEX_DIGITS.length)]).join('')}`;
const normalizeKey = (key: string) => key.toLowerCase().trim();
const hexColorToRgbArray = (colorHex: string): number[] =>
  (colorHex.match(/../g) ?? []).map((hex) => parseInt(hex, 16) || 0);
// HSP by Darel Rex Finley https://alienryderflex.com/hsp.html
const perceivedLightness = (r = 0, g = 0, b = 0) => round(sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2));

export class ColorGenerator {
  private readonly colors: Record<string, string>;
  private readonly lights: Record<string, boolean>;

  public constructor(private readonly storage?: TagColorsStorage) {
    this.colors = this.storage?.getTagColors() ?? {};
    this.lights = {};
  }

  public getColorForKey(key: string) {
    const normalizedKey = normalizeKey(key);
    const color = this.colors[normalizedKey];

    // If a color has not been set yet, generate a random one and save it
    if (!color) {
      return this.setColorForKey(normalizedKey, buildRandomColor());
    }

    return color;
  }

  public setColorForKey(key: string, color: string) {
    const normalizedKey = normalizeKey(key);

    this.colors[normalizedKey] = color;
    this.storage?.storeTagColors(this.colors);

    return color;
  }

  public stylesForKey(key: string): Pick<CSSProperties, 'color' | 'backgroundColor'> {
    const backgroundColor = this.getColorForKey(key);
    return {
      backgroundColor,
      color: this.isLightColor(backgroundColor) ? '#222' : '#fff',
    };
  }

  private isLightColor(color: string): boolean {
    const colorHex = color.substring(1);

    if (this.lights[colorHex] === undefined) {
      const rgb = hexColorToRgbArray(colorHex);
      this.lights[colorHex] = perceivedLightness(...rgb) >= LIGHTNESS_BREAKPOINT;
    }

    return this.lights[colorHex];
  }
}
