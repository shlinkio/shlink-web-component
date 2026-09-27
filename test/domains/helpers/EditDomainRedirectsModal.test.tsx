import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
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
    redirects: { baseUrlRedirect: 'https://baz.com' },
  });
  const setUp = () =>
    renderWithStore(<EditDomainRedirectsModal domain={domain} isOpen onClose={onClose} />, { apiClientFactory });

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders domain in header', async () => {
    const screen = await setUp();
    await expect.element(screen.getByRole('heading')).toHaveTextContent('Edit redirects for foo.com');
  });

  it('has different handlers to onClose the modal', async () => {
    const { user, ...screen } = await setUp();

    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByLabelText('Close dialog'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('saves expected values when form is submitted', async () => {
    const { user, ...screen } = await setUp();
    const submitForm = () => user.click(screen.getByRole('button', { name: 'Save' }));

    expect(editDomainRedirects).not.toHaveBeenCalled();
    await submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'https://baz.com',
      regular404Redirect: null,
      invalidShortUrlRedirect: null,
    });

    await user.clear(screen.getByLabelText(/Regular 404/));
    await user.fill(screen.getByLabelText(/Base URL/), 'https://new_base_url.com');
    await user.fill(screen.getByLabelText(/Invalid short URL/), 'https://new_invalid_short_url.com');
    await submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'https://new_base_url.com',
      regular404Redirect: null,
      invalidShortUrlRedirect: 'https://new_invalid_short_url.com',
    });

    await user.fill(screen.getByLabelText(/Regular 404/), 'https://new_regular_404.com');
    await user.clear(screen.getByLabelText(/Invalid short URL/));
    await submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: 'https://new_base_url.com',
      regular404Redirect: 'https://new_regular_404.com',
      invalidShortUrlRedirect: null,
    });

    await user.clear(screen.getByLabelText(/Base URL/));
    await user.clear(screen.getByLabelText(/Regular 404/));
    await submitForm();
    expect(editDomainRedirects).toHaveBeenLastCalledWith({
      domain: 'foo.com',
      baseUrlRedirect: null,
      regular404Redirect: null,
      invalidShortUrlRedirect: null,
    });
  });
});
