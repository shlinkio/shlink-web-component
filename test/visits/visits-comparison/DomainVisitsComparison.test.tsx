import type { ShlinkVisitsList } from '@shlinkio/shlink-js-sdk/api-contract';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { DomainVisitsComparison } from '../../../src/visits/visits-comparison/DomainVisitsComparison';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithStore } from '../../__helpers__/setUpTest';

describe('<DomainVisitsComparison />', () => {
  const getDomainVisits = vi.fn().mockResolvedValue(fromPartial<ShlinkVisitsList>({
    data: [],
    pagination: { pagesCount: 1, currentPage: 1, totalItems: 0 },
  }));
  const setUp = async (domains = ['foo', 'bar', 'baz']) => {
    const renderResult = renderWithStore(
      <MemoryRouter initialEntries={[{ search: `?domains=${domains.join(',')}` }]}>
        <DomainVisitsComparison />
      </MemoryRouter>,
      {
        apiClientFactory: () => fromPartial({ getDomainVisits }),
      },
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('loads domains on mount', async (domains) => {
    await setUp(domains);
    expect(getDomainVisits).toHaveBeenCalledTimes(domains.length);
  });

  it('cancels loading visits when unmounted', async () => {
    const { store } = await setUp();
    const isCanceled = () => store.getState().domainVisitsComparison.status === 'canceled';

    expect(isCanceled()).toBe(false);
    cleanup();
    expect(isCanceled()).toBe(true);
  });

  it.each([
    [['foo']],
    [['foo', 'bar']],
    [['baz', 'something', 'whatever']],
  ])('renders domains in title', async (domains) => {
    const setUpPromise = setUp(domains);
    expect(screen.getByRole('heading', { name: `Comparing "${domains.join('", "')}"` })).toBeInTheDocument();

    await setUpPromise;
  });
});
