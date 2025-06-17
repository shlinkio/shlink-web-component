import { brandColor } from '@shlinkio/shlink-frontend-kit';
import { fromPartial } from '@total-typescript/shoehorn';
import { ColorGenerator } from '../../../src/utils/services/ColorGenerator';
import type { TagColorsStorage } from '../../../src/utils/services/TagColorsStorage';

describe('ColorGenerator', () => {
  let colorGenerator: ColorGenerator;
  const storageMock = fromPartial<TagColorsStorage>({
    storeTagColors: vi.fn(),
    getTagColors: vi.fn().mockImplementation(() => ({})),
  });

  beforeEach(() => {
    colorGenerator = new ColorGenerator(storageMock);
  });

  it('sets a color in the storage and makes it available after that', () => {
    const color = '#ff0000';

    colorGenerator.setColorForKey('foo', color);

    expect(colorGenerator.getColorForKey('foo')).toEqual(color);
    expect(storageMock.storeTagColors).toHaveBeenCalledOnce();
    expect(storageMock.getTagColors).toHaveBeenCalledOnce();
  });

  it('generates a random color when none is available for requested key', () => {
    expect(colorGenerator.getColorForKey('bar')).toEqual(expect.stringMatching(/^#(?:[0-9a-fA-F]{6})$/));
    expect(storageMock.storeTagColors).toHaveBeenCalledOnce();
    expect(storageMock.getTagColors).toHaveBeenCalledOnce();
  });

  it('trims and lower cases keys before trying to match', () => {
    const color = '#ff0000';

    colorGenerator.setColorForKey('foo', color);

    expect(colorGenerator.getColorForKey('  foo')).toEqual(color);
    expect(colorGenerator.getColorForKey('foO')).toEqual(color);
    expect(colorGenerator.getColorForKey('FoO')).toEqual(color);
    expect(colorGenerator.getColorForKey('FOO')).toEqual(color);
    expect(colorGenerator.getColorForKey('FOO  ')).toEqual(color);
    expect(colorGenerator.getColorForKey(' FoO  ')).toEqual(color);
    expect(storageMock.storeTagColors).toHaveBeenCalledOnce();
    expect(storageMock.getTagColors).toHaveBeenCalledOnce();
  });

  describe('stylesForKey', () => {
    it.each([
      [brandColor(), '#222'],
      ['#8A661C', '#fff'],
      ['#F7BE05', '#222'],
      ['#5A02D8', '#fff'],
      ['#202786', '#fff'],
    ])('returns that the color for a key is light based on the color assigned to that key', (background, textColor) => {
      colorGenerator.setColorForKey('foo', background);

      expect(textColor).toEqual(colorGenerator.stylesForKey('foo').color);
      expect(textColor).toEqual(colorGenerator.stylesForKey('foo').color); // To cover when color is already calculated
    });
  });
});
