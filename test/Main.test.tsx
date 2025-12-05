import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ShlinkSidebarVisibilityProvider } from '../src';
import type { MainProps } from '../src/Main';
import { MainFactory } from '../src/Main';
import { checkAccessibility } from './__helpers__/accessibility';
import { renderWithStore } from './__helpers__/setUpTest';

vi.mock(import('../src/redirect-rules/ShortUrlRedirectRules'), () => ({
  ShortUrlRedirectRules: () => <>ShortUrlRedirectRules</>,
}));
vi.mock(import('../src/visits/visits-comparison/ShortUrlVisitsComparison'), () => ({
  ShortUrlVisitsComparison: () => <>ShortUrlVisitsComparison</>,
}));
vi.mock(import('../src/visits/visits-comparison/DomainVisitsComparison'), () => ({
  DomainVisitsComparison: () => <>DomainVisitsComparison</>,
}));
vi.mock(import('../src/visits/visits-comparison/TagVisitsComparison'), () => ({
  TagVisitsComparison: () => <>TagVisitsComparison</>,
}));

type SetUpOptions = {
  currentPath?: string
  createNotFound?: MainProps['createNotFound'];
  autoToggleButton?: boolean;
};

describe('<Main />', () => {
  const Main = MainFactory(fromPartial({
    TagsList: () => <>TagsList</>,
    ShortUrlsList: () => <>ShortUrlsList</>,
    CreateShortUrl: () => <>CreateShortUrl</>,
    ShortUrlVisits: () => <>ShortUrlVisits</>,
    TagVisits: () => <>TagVisits</>,
    DomainVisits: () => <>DomainVisits</>,
    OrphanVisits: () => <>OrphanVisits</>,
    NonOrphanVisits: () => <>NonOrphanVisits</>,
    Overview: () => <>OverviewRoute</>,
    EditShortUrl: () => <>EditShortUrl</>,
  }));
  const setUp = ({ createNotFound, currentPath = '/', autoToggleButton = true }: SetUpOptions) => renderWithStore(
    <MemoryRouter initialEntries={[{ pathname: currentPath }]}>
      <ShlinkSidebarVisibilityProvider>
        <Main createNotFound={createNotFound} autoToggleButton={autoToggleButton} />
      </ShlinkSidebarVisibilityProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({})));

  it.each([
    ['/overview', 'OverviewRoute'],
    ['/list-short-urls/1', 'ShortUrlsList'],
    ['/create-short-url', 'CreateShortUrl'],
    ['/short-code/abc123/visits/foo', 'ShortUrlVisits'],
    ['/short-code/abc123/edit', 'EditShortUrl'],
    ['/short-code/abc123/redirect-rules', 'ShortUrlRedirectRules'],
    ['/tag/foo/visits/foo', 'TagVisits'],
    ['/orphan-visits/foo', 'OrphanVisits'],
    ['/manage-tags', 'TagsList'],
    ['/domain/domain.com/visits/foo', 'DomainVisits'],
    ['/non-orphan-visits/foo', 'NonOrphanVisits'],
    ['/manage-domains', 'Domain'],
    ['/tags/compare-visits', 'TagVisitsComparison'],
    ['/domains/compare-visits', 'DomainVisitsComparison'],
    ['/short-urls/compare-visits', 'ShortUrlVisitsComparison'],
  ])(
    'renders expected component based on location and server version',
    (currentPath, expectedContent) => {
      setUp({ currentPath });
      expect(screen.getByText(expectedContent)).toBeInTheDocument();
    },
  );

  it('renders not-found when trying to navigate to invalid route', () => {
    const createNotFound = () => <>Oops! Route not found.</>;
    setUp({ currentPath: '/foo/bar/baz', createNotFound });

    expect(screen.getByText('Oops! Route not found.')).toBeInTheDocument();
  });

  it.each([true, false])('can decide whether to render a toggle button or not', (autoToggleButton) => {
    setUp({ autoToggleButton });

    if (autoToggleButton) {
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();
    }
  });
});
