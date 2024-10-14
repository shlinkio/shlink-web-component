import { Message, Result, SearchField, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { ShlinkApiError } from '../common/ShlinkApiError';
import { VisitsComparisonCollector } from '../visits/visits-comparison/VisitsComparisonCollector';
import { useVisitsComparison, VisitsComparisonProvider } from '../visits/visits-comparison/VisitsComparisonContext';
import { DomainRow } from './DomainRow';
import type { EditDomainRedirects } from './reducers/domainRedirects';
import type { DomainsList } from './reducers/domainsList';

interface ManageDomainsProps {
  filterDomains: (searchTerm: string) => void;
  editDomainRedirects: (redirects: EditDomainRedirects) => Promise<void>;
  checkDomainHealth: (domain: string) => void;
  domainsList: DomainsList;
}

const headers: Array<{ value: string; isHidden: boolean }> = [
  {
    value: 'Is default domain',
    isHidden: true,
  },
  {
    value: 'Domain',
    isHidden: false,
  },
  {
    value: 'Base path redirect',
    isHidden: false,
  },
  {
    value: 'Regular 404 redirect',
    isHidden: false,
  },
  {
    value: 'Invalid short URL redirect',
    isHidden: false,
  },
  {
    value: 'Domain status',
    isHidden: true,
  },
  {
    value: 'Options',
    isHidden: true,
  },
];

export const ManageDomains: FC<ManageDomainsProps> = (
  { domainsList, filterDomains, editDomainRedirects, checkDomainHealth },
) => {
  const { filteredDomains: domains, defaultRedirects, loading, error, errorData } = domainsList;
  const resolvedDefaultRedirects = defaultRedirects ?? domains.find(({ isDefault }) => isDefault)?.redirects;
  const visitsComparison = useVisitsComparison();

  if (loading) {
    return <Message loading />;
  }

  const renderContent = () => {
    if (error) {
      return (
        <Result type="error">
          <ShlinkApiError errorData={errorData} fallbackMessage="Error loading domains :(" />
        </Result>
      );
    }

    return (
      <SimpleCard>
        <table className="table table-hover responsive-table mb-0">
          <thead className="responsive-table__header">
            <tr>
              {headers.map((column, index) => (
                <th key={index}>
                  <span className={column.isHidden ? 'sr-only' : undefined}>{column.value}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.length < 1 && <tr><td colSpan={headers.length} className="text-center">No results found</td></tr>}
            {domains.map((domain) => (
              <DomainRow
                key={domain.domain}
                domain={domain}
                editDomainRedirects={editDomainRedirects}
                checkDomainHealth={checkDomainHealth}
                defaultRedirects={resolvedDefaultRedirects}
              />
            ))}
          </tbody>
        </table>
      </SimpleCard>
    );
  };

  return (
    <VisitsComparisonProvider value={visitsComparison}>
      <SearchField className="mb-3" onChange={filterDomains} />
      <VisitsComparisonCollector type="domains" className="mb-3" />
      {renderContent()}
    </VisitsComparisonProvider>
  );
};
