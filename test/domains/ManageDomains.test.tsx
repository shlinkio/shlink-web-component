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
    const screen = await renderWithStore(
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
    await expect.element(screen.getByTestId('domain-health-loader')).not.toBeInTheDocument();

    return screen;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows loading message while domains are loading', async () => {
    const screen = await setUp({ status: 'loading' });

    await expect.element(screen.getByText('Loading...')).toBeInTheDocument();
    await expect.element(screen.getByText('Error loading domains :(')).not.toBeInTheDocument();
  });

  it.each([
    [undefined, 'Error loading domains :('],
    [fromPartial<ProblemDetailsError>({}), 'Error loading domains :('],
    [fromPartial<ProblemDetailsError>({ detail: 'Foo error!!' }), 'Foo error!!'],
  ])('shows error result when domains loading fails', async (error, expectedErrorMessage) => {
    const screen = await setUp({ status: 'error', error });

    await expect.element(screen.getByText('Loading...')).not.toBeInTheDocument();
    await expect.element(screen.getByText(expectedErrorMessage)).toBeInTheDocument();
  });

  it('filters domains when SearchField changes', async () => {
    const domains: Domain[] = [
      fromPartial({ domain: 'foo' }),
      fromPartial({ domain: 'bar' }),
      fromPartial({ domain: 'baz' }),
    ];
    const { user, ...screen } = await setUp(
      fromPartial({
        status: 'idle',
        domains,
        filteredDomains: domains,
      }),
    );

    expect(screen.getByRole('row').all()).toHaveLength(3);
    await user.type(screen.getByPlaceholder('Search...'), 'ba');
    await expect.poll(() => screen.getByRole('row').all()).toHaveLength(2);
  });

  it('shows expected headers and one row when list of domains is empty', async () => {
    const screen = await setUp();

    expect(
      screen
        .getByRole('columnheader', {
          // Tests are run in a mobile resolution, where table headers are hidden
          includeHidden: true,
        })
        .all(),
    ).toHaveLength(7);
    await expect.element(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('has many rows if multiple domains are provided', async () => {
    const filteredDomains: Domain[] = [
      fromPartial({ domain: 'foo' }),
      fromPartial({ domain: 'bar' }),
      fromPartial({ domain: 'baz' }),
    ];
    const screen = await setUp({ filteredDomains });

    expect(screen.getByRole('row').all()).toHaveLength(filteredDomains.length);
    await expect.element(screen.getByText('foo')).toBeInTheDocument();
    await expect.element(screen.getByText('bar')).toBeInTheDocument();
    await expect.element(screen.getByText('baz')).toBeInTheDocument();
  });
});
