import { cleanup, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ContainerProvider } from '../../../src/container/context';
import { DomainVisitsComparison } from '../../../src/visits/visits-comparison/DomainVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';

describe('<DomainVisitsComparison />', () => {
  const getDomainVisitsForComparison = vi.fn();
  const cancelGetDomainVisitsComparison = vi.fn();
  const setUp = (domains = ['foo', 'bar', 'baz']) => renderWithStore(
    <ContainerProvider value={fromPartial({ apiClientFactory: vi.fn() })}>
      <MemoryRouter initialEntries={[{ search: `?domains=${domains.join(',')}` }]}>
        <DomainVisitsComparison
          getDomainVisitsForComparison={getDomainVisitsForComparison}
          cancelGetDomainVisitsComparison={cancelGetDomainVisitsComparison}
          domainVisitsComparison={fromPartial({
            visitsGroups: Object.fromEntries(domains.map((domain) => [domain, []])),
          })}
        />
      </MemoryRouter>
    </ContainerProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('loads domains on mount', (domains) => {
    setUp(domains);
    expect(getDomainVisitsForComparison).toHaveBeenLastCalledWith(expect.objectContaining({ domains }));
  });

  it('cancels loading visits when unmounted', () => {
    setUp();

    expect(cancelGetDomainVisitsComparison).not.toHaveBeenCalled();
    cleanup();
    expect(cancelGetDomainVisitsComparison).toHaveBeenCalledOnce();
  });

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('renders domains in title', (domains) => {
    setUp(domains);
    expect(screen.getByRole('heading', { name: `Comparing "${domains.join('", "')}"` })).toBeInTheDocument();
  });
});
