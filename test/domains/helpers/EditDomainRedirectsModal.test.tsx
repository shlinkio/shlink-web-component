import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkDomain } from '../../../src/api-contract';
import { EditDomainRedirectsModal } from '../../../src/domains/helpers/EditDomainRedirectsModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';

describe('<EditDomainRedirectsModal />', () => {
  const editDomainRedirects = vi.fn().mockResolvedValue(undefined);
  const apiClientFactory = vi.fn(() => fromPartial<ShlinkApiClient>({ editDomainRedirects }));
  const onClose = vi.fn();
  const domain = fromPartial<ShlinkDomain>({
    domain: 'foo.com',
    redirects: { baseUrlRedirect: 'baz' },
  });
  const setUp = () => renderWithStore(
    <EditDomainRedirectsModal domain={domain} isOpen onClose={onClose} />,
    { apiClientFactory },
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders domain in header', () => {
    setUp();
    expect(screen.getByRole('heading')).toHaveTextContent('Edit redirects for foo.com');
  });

  it('has different handlers to onClose the modal', async () => {
    const { user } = setUp();

    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText('Close dialog'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('saves expected values when form is submitted', async () => {
    const { user } = setUp();
    const submitForm = () => fireEvent.submit(screen.getByTestId('transition-container'));

    expect(editDomainRedirects).not.toHaveBeenCalled();
    submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'baz',
      regular404Redirect: null,
      invalidShortUrlRedirect: null,
    });

    await user.clear(screen.getByDisplayValue('baz'));
    await user.type(screen.getAllByPlaceholderText('No redirect')[0], 'new_base_url');
    await user.type(screen.getAllByPlaceholderText('No redirect')[2], 'new_invalid_short_url');
    submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'new_base_url',
      regular404Redirect: null,
      invalidShortUrlRedirect: 'new_invalid_short_url',
    });

    await user.type(screen.getAllByPlaceholderText('No redirect')[1], 'new_regular_404');
    await user.clear(screen.getByDisplayValue('new_invalid_short_url'));
    submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'new_base_url',
      regular404Redirect: 'new_regular_404',
      invalidShortUrlRedirect: null,
    });

    await Promise.all(screen.getAllByPlaceholderText('No redirect').map((element) => user.clear(element)));
    submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: null,
      regular404Redirect: null,
      invalidShortUrlRedirect: null,
    });
  });
});
