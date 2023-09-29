import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import { ShortUrlsRowMenuFactory } from '../../../src/short-urls/helpers/ShortUrlsRowMenu';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<ShortUrlsRowMenu />', () => {
  const ShortUrlsRowMenu = ShortUrlsRowMenuFactory(fromPartial({
    DeleteShortUrlModal: () => <i>DeleteShortUrlModal</i>,
    QrCodeModal: () => <i>QrCodeModal</i>,
  }));
  const shortUrl = fromPartial<ShlinkShortUrl>({
    shortCode: 'abc123',
    shortUrl: 'https://s.test/abc123',
  });
  const setUp = () => renderWithEvents(
    <MemoryRouter>
      <ShortUrlsRowMenu shortUrl={shortUrl} />
    </MemoryRouter>,
  );
  const openMenu = (user: UserEvent) => user.click(screen.getByRole('button'));

  it.each([
    [setUp],
    [async () => {
      const { user, container } = setUp();
      await openMenu(user);

      return { container };
    }],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders modal windows', () => {
    setUp();

    expect(screen.getByText('DeleteShortUrlModal')).toBeInTheDocument();
    expect(screen.getByText('QrCodeModal')).toBeInTheDocument();
  });

  it('renders correct amount of menu items', async () => {
    const { user } = setUp();

    await openMenu(user);
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });
});
