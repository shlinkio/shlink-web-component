import { fromPartial } from '@total-typescript/shoehorn';
import type { ColorGenerator } from '../../../../src/utils/services/ColorGenerator';

export const getColorForKey = vi.fn(() => 'red');

export const setColorForKey = vi.fn();

export const stylesForKey = vi.fn(() => ({ backgroundColor: 'red', color: '#fff' }));

export const colorGeneratorMock = fromPartial<ColorGenerator>({
  getColorForKey,
  setColorForKey,
  stylesForKey,
});
