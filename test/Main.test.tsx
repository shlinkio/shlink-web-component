import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router-dom';
import type { MainProps } from '../src/Main';
import { MainFactory } from '../src/Main';
import { FeaturesProvider } from '../src/utils/features';
import { checkAccessibility } from './__helpers__/accessibility';

type SetUpOptions = {
  currentPath?: string
  createNotFound?: MainProps['createNotFound'];
  domainVisitsSupported?: boolean;
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
  }));
  const setUp = ({ createNotFound, currentPath = '', domainVisitsSupported = true }: SetUpOptions) => render(
    <MemoryRouter initialEntries={[{ pathname: currentPath }]}>
      <FeaturesProvider value={fromPartial({ domainVisits: domainVisitsSupported })}>
        <Main createNotFound={createNotFound} />
      </FeaturesProvider>
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
  ])(
    'renders expected component based on location and server version',
    (currentPath, expectedContent) => {
      setUp({ currentPath });
      expect(screen.getByText(expectedContent)).toBeInTheDocument();
    },
  );

  it.each([
    ['/domain/domain.com/visits/foo', false],
    ['/foo/bar/baz', true],
  ])('renders not-found when trying to navigate to invalid route', (currentPath, domainVisitsSupported) => {
    const createNotFound = () => <>Oops! Route not found.</>;

    setUp({ currentPath, domainVisitsSupported, createNotFound });

    expect(screen.getByText('Oops! Route not found.')).toBeInTheDocument();
  });
});
