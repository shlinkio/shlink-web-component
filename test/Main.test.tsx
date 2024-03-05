import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { MainProps } from '../src/Main';
import { MainFactory } from '../src/Main';
import { checkAccessibility } from './__helpers__/accessibility';

type SetUpOptions = {
  currentPath?: string
  createNotFound?: MainProps['createNotFound'];
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
    ManageDomains: () => <>ManageDomains</>,
    TagVisitsComparison: () => <>TagVisitsComparison</>,
    DomainVisitsComparison: () => <>DomainVisitsComparison</>,
    ShortUrlVisitsComparison: () => <>ShortUrlVisitsComparison</>,
  }));
  const setUp = ({ createNotFound, currentPath = '' }: SetUpOptions) => render(
    <MemoryRouter initialEntries={[{ pathname: currentPath }]}>
      <Main createNotFound={createNotFound} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({})));

  it.each([
    ['/overview', 'OverviewRoute'],
    ['/list-short-urls/1', 'ShortUrlsList'],
    ['/create-short-url', 'CreateShortUrl'],
    ['/short-code/abc123/visits/foo', 'ShortUrlVisits'],
    ['/short-code/abc123/edit', 'EditShortUrl'],
    ['/tag/foo/visits/foo', 'TagVisits'],
    ['/orphan-visits/foo', 'OrphanVisits'],
    ['/manage-tags', 'TagsList'],
    ['/domain/domain.com/visits/foo', 'DomainVisits'],
    ['/non-orphan-visits/foo', 'NonOrphanVisits'],
    ['/manage-domains', 'ManageDomains'],
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
});
