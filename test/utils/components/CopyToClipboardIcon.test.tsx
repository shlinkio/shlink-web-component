import { CopyToClipboardIcon } from '../../../src/utils/components/CopyToClipboardIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CopyToClipboardIcon />', () => {
  const copyToClipboard = vi.fn();
  const onCopy = vi.fn();
  const setUp = (text = 'foo') => renderWithEvents(
    <CopyToClipboardIcon text={text} onCopy={onCopy} copyToClipboard={copyToClipboard} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('wraps expected components', () => {
    const { container } = setUp();
    expect(container).toMatchSnapshot();
  });

  it.each([
    ['text'],
    ['bar'],
    ['baz'],
  ])('copies content to clipboard when clicked', async (text) => {
    const { user, container } = setUp(text);

    expect(copyToClipboard).not.toHaveBeenCalled();
    container.firstElementChild && await user.click(container.firstElementChild);
    expect(copyToClipboard).toHaveBeenCalledWith({ text, onCopy });
  });
});
