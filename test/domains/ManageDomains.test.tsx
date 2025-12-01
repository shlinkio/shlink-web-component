import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ProblemDetailsError } from '../../src/api-contract';
import type { Domain } from '../../src/domains/data';
import { ManageDomains } from '../../src/domains/ManageDomains';
import type { DomainsList } from '../../src/domains/reducers/domainsList';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithStore } from '../__helpers__/setUpTest';

describe('<ManageDomains />', () => {
  const setUp = async (domainsList: Partial<DomainsList> = {}) => {
    const renderResult = renderWithStore(
      <MemoryRouter>
        <ManageDomains />
      </MemoryRouter>,
      {
        initialState: {
          domainsList: fromPartial({ status: 'idle', domains: [], filteredDomains: [], ...domainsList }),
        },
        apiClientFactory: () => fromPartial({ health: vi.fn().mockReturnValue({ status: 'valid' }) }),
      },
    );

    // Wait for all domains to finish their health checks
    await waitFor(() => expect(screen.queryByTestId('domain-health-loader')).not.toBeInTheDocument());

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows loading message while domains are loading', async () => {
    await setUp({ status: 'loading' });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Error loading domains :(')).not.toBeInTheDocument();
  });

  it.each([
    [undefined, 'Error loading domains :('],
    [fromPartial<ProblemDetailsError>({}), 'Error loading domains :('],
    [fromPartial<ProblemDetailsError>({ detail: 'Foo error!!' }), 'Foo error!!'],
  ])('shows error result when domains loading fails', async (error, expectedErrorMessage) => {
    await setUp({ status: 'error', error });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
  });

  it('filters domains when SearchField changes', async () => {
    const domains: Domain[] = [
      fromPartial({ domain: 'foo' }),
      fromPartial({ domain: 'bar' }),
      fromPartial({ domain: 'baz' }),
    ];
    const { user } = await setUp(fromPartial({
      status: 'idle',
      domains,
      filteredDomains: domains,
    }));

    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.type(screen.getByPlaceholderText('Search...'), 'ba');
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(2));
  });

  it('shows expected headers and one row when list of domains is empty', async () => {
    await setUp();

    expect(screen.getAllByRole('columnheader', {
      // Tests are run in a mobile resolution, where table headers are hidden
      hidden: true,
    })).toHaveLength(7);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('has many rows if multiple domains are provided', async () => {
    const filteredDomains: Domain[] = [
      fromPartial({ domain: 'foo' }),
      fromPartial({ domain: 'bar' }),
      fromPartial({ domain: 'baz' }),
    ];
    await setUp({ filteredDomains });

    expect(screen.getAllByRole('row')).toHaveLength(filteredDomains.length);
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(screen.getByText('baz')).toBeInTheDocument();
  });
});
