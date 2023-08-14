import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { CreateShortUrlResult as createResult } from '../../../src/short-urls/helpers/CreateShortUrlResult';
import type { ShortUrlCreation } from '../../../src/short-urls/reducers/shortUrlCreation';
import type { TimeoutToggle } from '../../../src/utils/helpers/hooks';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CreateShortUrlResult />', () => {
  const copyToClipboard = vi.fn();
  const useTimeoutToggle = vi.fn(() => [false, copyToClipboard]) as TimeoutToggle;
  const CreateShortUrlResult = createResult(useTimeoutToggle);
  const setUp = (creation: ShortUrlCreation, canBeClosed?: boolean) => renderWithEvents(
    <CreateShortUrlResult resetCreateShortUrl={() => {}} creation={creation} canBeClosed={canBeClosed} />,
  );

  it('renders an error when error is true', () => {
    setUp({ error: true, saved: false, saving: false });
    expect(screen.getByText('An error occurred while creating the URL :(')).toBeInTheDocument();
  });

  it.each([[true], [false]])('renders nothing when not saved yet', (saving) => {
    const { container } = setUp({ error: false, saved: false, saving });
    expect(container.firstChild).toBeNull();
  });

  it('renders a result message when result is provided', () => {
    setUp(
      { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), saving: false, saved: true, error: false },
    );
    expect(screen.getByText(/The short URL is/)).toHaveTextContent('Great! The short URL is https://s.test/abc123');
  });

  it('Invokes tooltip timeout when copy to clipboard button is clicked', async () => {
    const { user } = setUp(
      { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), saving: false, saved: true, error: false },
    );

    expect(copyToClipboard).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button'));
    expect(copyToClipboard).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), saving: false, saved: true, error: false },
      'success-close-button',
      'error-close-button',
    ],
    [{ error: true, saved: false, saving: false }, 'error-close-button', 'success-close-button'],
  ])('displays close button if the result can be closed', (data, foundElement, notFoundElement) => {
    setUp(data as any, true);

    expect(screen.getByTestId(foundElement)).toBeInTheDocument();
    expect(screen.queryByTestId(notFoundElement)).not.toBeInTheDocument();
  });
});
