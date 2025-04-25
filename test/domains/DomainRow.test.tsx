import { Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkDomainRedirects } from '../../src/api-contract';
import type { Domain } from '../../src/domains/data';
import { DomainRow } from '../../src/domains/DomainRow';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<DomainRow />', () => {
  const redirectsCombinations = [
    [fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'foo' })],
    [fromPartial<ShlinkDomainRedirects>({ invalidShortUrlRedirect: 'bar' })],
    [fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'baz', regular404Redirect: 'foo' })],
    [
      fromPartial<ShlinkDomainRedirects>(
        { baseUrlRedirect: 'baz', regular404Redirect: 'bar', invalidShortUrlRedirect: 'foo' },
      ),
    ],
  ];
  const setUp = (domain: Domain, defaultRedirects?: ShlinkDomainRedirects) => render(
    <MemoryRouter>
      <Table header={<></>}>
        <DomainRow
          domain={domain}
          defaultRedirects={defaultRedirects}
          editDomainRedirects={vi.fn()}
          checkDomainHealth={vi.fn()}
        />
      </Table>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(
    setUp(fromPartial({ domain: 'domain', isDefault: true })),
  ));

  it.each(redirectsCombinations)('shows expected redirects', (redirects) => {
    setUp(fromPartial({ domain: '', isDefault: true, redirects }));

    if (redirects?.baseUrlRedirect) {
      expect(screen.getByRole('cell', { name: redirects.baseUrlRedirect })).toBeInTheDocument();
    }
    if (redirects?.regular404Redirect) {
      expect(screen.getByRole('cell', { name: redirects.regular404Redirect })).toBeInTheDocument();
    }
    if (redirects?.invalidShortUrlRedirect) {
      expect(screen.getByRole('cell', { name: redirects.invalidShortUrlRedirect })).toBeInTheDocument();
    }
    expect(screen.queryByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each([
    [undefined],
    [fromPartial<ShlinkDomainRedirects>({})],
  ])('shows expected "no redirects"', (redirects) => {
    setUp(fromPartial({ domain: '', isDefault: true, redirects }));

    expect(screen.getAllByRole('cell', { name: 'No redirect' })).toHaveLength(3);
    expect(screen.queryByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each(redirectsCombinations)('shows expected fallback redirects', (fallbackRedirects) => {
    setUp(fromPartial({ domain: '', isDefault: true }), fallbackRedirects);

    if (fallbackRedirects?.baseUrlRedirect) {
      expect(
        screen.getByRole('cell', { name: `${fallbackRedirects.baseUrlRedirect} (as fallback)` }),
      ).toBeInTheDocument();
    }
    if (fallbackRedirects?.regular404Redirect) {
      expect(
        screen.getByRole('cell', { name: `${fallbackRedirects.regular404Redirect} (as fallback)` }),
      ).toBeInTheDocument();
    }
    if (fallbackRedirects?.invalidShortUrlRedirect) {
      expect(
        screen.getByRole('cell', { name: `${fallbackRedirects.invalidShortUrlRedirect} (as fallback)` }),
      ).toBeInTheDocument();
    }
  });

  it.each([[true], [false]])('shows icon on default domain only', (isDefault) => {
    const { container } = setUp(fromPartial({ domain: '', isDefault }));

    if (isDefault) {
      expect(container.querySelector('#defaultDomainIcon')).toBeInTheDocument();
    } else {
      expect(container.querySelector('#defaultDomainIcon')).not.toBeInTheDocument();
    }
  });
});
