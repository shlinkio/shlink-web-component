import { CopyToClipboardIcon } from '../../../src/utils/components/CopyToClipboardIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CopyToClipboardIcon />', () => {
  const onCopy = vi.fn();
  const setUp = (text = 'foo') => renderWithEvents(<CopyToClipboardIcon text={text} onCopy={onCopy} />);

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

    expect(onCopy).not.toHaveBeenCalled();
    container.firstElementChild && await user.click(container.firstElementChild);
    expect(onCopy).toHaveBeenCalledWith(text, false);
  });
});
