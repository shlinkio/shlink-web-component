import { screen } from '@testing-library/react';
import { CopyToClipboardIcon } from '../../../src/utils/components/CopyToClipboardIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CopyToClipboardIcon />', () => {
  const copyToClipboard = vi.fn();
  const setUp = (text = 'foo', initialCopied = false) => renderWithEvents(
    <CopyToClipboardIcon text={text} copyToClipboard={copyToClipboard} initialCopied={initialCopied} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    ['text'],
    ['bar'],
    ['baz'],
  ])('copies content to clipboard when clicked', async (text) => {
    const { user } = setUp(text);

    expect(copyToClipboard).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText(`Copy ${text} to clipboard`));
    expect(copyToClipboard).toHaveBeenCalledWith(expect.objectContaining({ text }));
  });

  it.each([
    { initialCopied: false, expectedIcon: 'clone' },
    { initialCopied: true, expectedIcon: 'check' },
  ])('shows check icon after copying', ({ initialCopied, expectedIcon }) => {
    setUp('foo', initialCopied);
    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-icon', expectedIcon);
  });
});
