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
    { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), saving: false, saved: true, error: false },
    true,
  )));

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
