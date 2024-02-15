import { fromPartial } from '@total-typescript/shoehorn';
import { copyToClipboard } from '../../../src/utils/helpers/clipboard';

describe('clipboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const navigator = fromPartial<Navigator>({
    clipboard: { writeText },
  });
  const text = 'foo';
  const onCopy = vi.fn();

  it('does nothing when clipboard is not defined', async () => {
    await copyToClipboard({ text, onCopy }, fromPartial({}));
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('invokes callback with true when copying succeeds', async () => {
    await copyToClipboard({ text, onCopy }, navigator);
    expect(onCopy).toHaveBeenCalledWith(text, true);
  });

  it('invokes callback with false when copying fails', async () => {
    writeText.mockRejectedValue(undefined);
    await copyToClipboard({ text, onCopy }, navigator);
    expect(onCopy).toHaveBeenCalledWith(text, false);
  });
});
