import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { CopyToClipboardButton } from '../../../src/utils/components/CopyToClipboardButton';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CopyToClipboardButton />', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const navigator = fromPartial<typeof globalThis.navigator>({
    clipboard: { writeText },
  });
  const setUp = (text = 'foo', initialCopied = false) => renderWithEvents(
    <CopyToClipboardButton text={text} navigator_={navigator} initialCopied={initialCopied} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    ['text'],
    ['bar'],
    ['baz'],
  ])('copies content to clipboard when clicked', async (text) => {
    const { user } = setUp(text);

    expect(writeText).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(`Copy ${text} to clipboard`));
    expect(writeText).toHaveBeenCalledWith(text);
  });

  it.each([
    { initialCopied: false, expectedIcon: 'clone' },
    { initialCopied: true, expectedIcon: 'check' },
  ])('shows check icon after copying', ({ initialCopied, expectedIcon }) => {
    setUp('foo', initialCopied);
    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-icon', expectedIcon);
  });
});
