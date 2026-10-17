import { Card, Table } from '@shlinkio/shlink-frontend-kit';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkDomainRedirects } from '../../src/api-contract';
import type { Domain } from '../../src/domains/data';
import { DomainRow } from '../../src/domains/DomainRow';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<DomainRow />', () => {
  const redirectsCombinations = [
    fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'foo' }),
    fromPartial<ShlinkDomainRedirects>({ invalidShortUrlRedirect: 'bar' }),
    fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'baz', regular404Redirect: 'foo' }),
    fromPartial<ShlinkDomainRedirects>({
      baseUrlRedirect: 'baz',
      regular404Redirect: 'bar',
      invalidShortUrlRedirect: 'foo',
    }),
  ];
  const setUp = (domain: Domain, defaultRedirects?: ShlinkDomainRedirects) =>
    renderWithStore(
      <MemoryRouter>
        {/* Wrap in Card so that it has the proper background color and passes a11y contrast checks */}
        <Card>
          <Table header={<></>}>
            <DomainRow domain={domain} defaultRedirects={defaultRedirects} checkDomainHealth={vi.fn()} />
          </Table>
        </Card>
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp(fromPartial({ domain: 'domain', isDefault: true }))));

  it.each(redirectsCombinations)('shows expected redirects', async (redirects) => {
    const screen = await setUp(fromPartial({ domain: '', isDefault: true, redirects }));

    if (redirects?.baseUrlRedirect) {
      await expect.element(screen.getByText(redirects.baseUrlRedirect)).toBeInTheDocument();
    }
    if (redirects?.regular404Redirect) {
      await expect.element(screen.getByText(redirects.regular404Redirect)).toBeInTheDocument();
    }
    if (redirects?.invalidShortUrlRedirect) {
      await expect.element(screen.getByText(redirects.invalidShortUrlRedirect)).toBeInTheDocument();
    }

    await expect.element(screen.getByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each([undefined, fromPartial<ShlinkDomainRedirects>({})])('shows expected "no redirects"', async (redirects) => {
    const screen = await setUp(fromPartial({ domain: '', isDefault: true, redirects }));

    expect(screen.getByText('No redirect').all()).toHaveLength(3);
    await expect.element(screen.getByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each(redirectsCombinations)('shows expected fallback redirects', async (fallbackRedirects) => {
    const screen = await setUp(fromPartial({ domain: '', isDefault: true }), fallbackRedirects);

    if (fallbackRedirects?.baseUrlRedirect) {
      await expect.element(screen.getByText(`${fallbackRedirects.baseUrlRedirect} (as fallback)`)).toBeInTheDocument();
    }
    if (fallbackRedirects?.regular404Redirect) {
      await expect
        .element(screen.getByText(`${fallbackRedirects.regular404Redirect} (as fallback)`))
        .toBeInTheDocument();
    }
    if (fallbackRedirects?.invalidShortUrlRedirect) {
      await expect
        .element(screen.getByText(`${fallbackRedirects.invalidShortUrlRedirect} (as fallback)`))
        .toBeInTheDocument();
    }
  });

  it.each([true, false])('shows icon on default domain only', async (isDefault) => {
    const screen = await setUp(fromPartial({ domain: '', isDefault }));

    if (isDefault) {
      await expect.element(screen.getByTestId('default-domain-icon')).toBeInTheDocument();
    } else {
      await expect.element(screen.getByTestId('default-domain-icon')).not.toBeInTheDocument();
    }
  });
});
