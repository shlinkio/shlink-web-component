import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { CreateShortUrlResult } from '../../../src/short-urls/helpers/CreateShortUrlResult';
import type { ShortUrlCreation } from '../../../src/short-urls/reducers/shortUrlCreation';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CreateShortUrlResult />', () => {
  const setUp = (creation: ShortUrlCreation, canBeClosed?: boolean) => renderWithEvents(
    <CreateShortUrlResult resetCreateShortUrl={() => {}} creation={creation} canBeClosed={canBeClosed} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp(
    { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' },
    true,
  )));

  it('renders an error when error is true', () => {
    setUp({ status: 'error' });
    expect(screen.getByText('An error occurred while creating the URL :(')).toBeInTheDocument();
  });

  it.each(['saving' as const, 'idle' as const])('renders nothing when not saved yet', (status) => {
    const { container } = setUp({ status });
    expect(container.firstChild).toBeNull();
  });

  it('renders a result message when result is provided', () => {
    setUp({ result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' });
    expect(screen.getByText(/The short URL is/)).toHaveTextContent('Great! The short URL is https://s.test/abc123');
  });

  it.each([
    [
      { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' },
      'success-close-button',
      'error-close-button',
    ],
    [{ status: 'error' }, 'error-close-button', 'success-close-button'],
  ])('displays close button if the result can be closed', (data, foundElement, notFoundElement) => {
    setUp(data as any, true);

    expect(screen.getByTestId(foundElement)).toBeInTheDocument();
    expect(screen.queryByTestId(notFoundElement)).not.toBeInTheDocument();
  });
});
