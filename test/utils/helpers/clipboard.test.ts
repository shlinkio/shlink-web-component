import { fromPartial } from '@total-typescript/shoehorn';
import { copyToClipboard } from '../../../src/utils/helpers/clipboard';

describe('clipboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const navigator = fromPartial<Navigator>({
    clipboard: { writeText },
  });
  const defaultText = 'foo';
  const onCopy = vi.fn();

  it('does nothing when clipboard is not defined', async () => {
    await copyToClipboard({ text: defaultText, onCopy }, fromPartial({}));
    expect(onCopy).not.toHaveBeenCalled();
  });

  it.each([
    defaultText,
    Promise.resolve(defaultText),
  ])('invokes callback with true when copying succeeds', async (text) => {
    await copyToClipboard({ text, onCopy }, navigator);
    expect(onCopy).toHaveBeenCalledWith({ text: defaultText, copied: true });
  });

  it.each([
    defaultText,
    Promise.resolve(defaultText),
  ])('invokes callback with false when copying fails', async (text) => {
    writeText.mockRejectedValue(undefined);
    await copyToClipboard({ text, onCopy }, navigator);
    expect(onCopy).toHaveBeenCalledWith({ text: defaultText, copied: false });
  });
});
