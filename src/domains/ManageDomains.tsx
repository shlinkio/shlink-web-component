import { Message, Result, SearchInput, SimpleCard, Table } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { ShlinkApiError } from '../common/ShlinkApiError';
import { VisitsComparisonCollector } from '../visits/visits-comparison/VisitsComparisonCollector';
import { useVisitsComparison, VisitsComparisonProvider } from '../visits/visits-comparison/VisitsComparisonContext';
import { DomainRow } from './DomainRow';
import { useDomainsList } from './reducers/domainsList';

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

export const ManageDomains: FC = () => {
  const { domainsList, filterDomains, checkDomainHealth } = useDomainsList();
  const { filteredDomains: domains, defaultRedirects, status } = domainsList;
  const resolvedDefaultRedirects = defaultRedirects ?? domains.find(({ isDefault }) => isDefault)?.redirects;
  const visitsComparison = useVisitsComparison();

  if (status === 'loading') {
    return <Message loading />;
  }

  return (
    <VisitsComparisonProvider value={visitsComparison}>
      <div className="flex flex-col gap-y-4">
        <SearchInput onChange={filterDomains} />
        <VisitsComparisonCollector type="domains" />
        {status === 'error' ? (
          <Result variant="error">
            <ShlinkApiError errorData={domainsList.error} fallbackMessage="Error loading domains :(" />
          </Result>
        ) : (
          <SimpleCard className="card">
            <Table header={
              <Table.Row>
                {headers.map((column, index) => (
                  <Table.Cell key={index}>
                    <span className={column.isHidden ? 'sr-only' : undefined}>{column.value}</span>
                  </Table.Cell>
                ))}
              </Table.Row>
            }>
              {domains.length < 1 && (
                <Table.Row>
                  <Table.Cell colSpan={headers.length} className="text-center">No results found</Table.Cell>
                </Table.Row>
              )}
              {domains.map((domain) => (
                <DomainRow
                  key={domain.domain}
                  domain={domain}
                  checkDomainHealth={checkDomainHealth}
                  defaultRedirects={resolvedDefaultRedirects}
                />
              ))}
            </Table>
          </SimpleCard>
        )}
      </div>
    </VisitsComparisonProvider>
  );
};
