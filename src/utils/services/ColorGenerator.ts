import type { CSSProperties } from 'react';
import { buildRandomColor, isLightColor } from '../helpers/color';
import type { TagColorsStorage } from './TagColorsStorage';

const normalizeKey = (key: string) => key.toLowerCase().trim();

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
      this.lights[colorHex] = isLightColor(colorHex);
    }

    return this.lights[colorHex];
  }
}
