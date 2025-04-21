import { fromPartial } from '@total-typescript/shoehorn';
import type { ColorGenerator } from '../../../../src/utils/services/ColorGenerator';

export const getColorForKey = vi.fn(() => '#eb0000');

export const setColorForKey = vi.fn();

// Mock a combination of background and color that has enough contrast, to avoid false negative accessibility tests.
// See https://webaim.org/resources/contrastchecker/?fcolor=FFFFFF&bcolor=EB0000
export const stylesForKey = vi.fn(() => ({ backgroundColor: '#eb0000', color: '#fff' }));

export const colorGeneratorMock = fromPartial<ColorGenerator>({
  getColorForKey,
  setColorForKey,
  stylesForKey,
});
