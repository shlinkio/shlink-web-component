import { useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import type { LoadDomainVisitsForComparison } from './reducers/domainVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type DomainVisitsComparisonProps = {
  getDomainVisitsForComparison: (params: LoadDomainVisitsForComparison) => void;
  domainVisitsComparison: VisitsComparisonInfo;
  cancelGetDomainVisitsComparison: () => void;
};

// TODO Bind to mercure for visits creation
export const DomainVisitsComparison: FC<DomainVisitsComparisonProps> = (
  { getDomainVisitsForComparison, domainVisitsComparison, cancelGetDomainVisitsComparison },
) => {
  const { domains } = useParsedQuery<{ domains: string }>();
  const domainsArray = useMemo(() => domains.split(','), [domains]);
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getDomainVisitsForComparison({ ...params, domains: domainsArray }),
    [domainsArray, getDomainVisitsForComparison],
  );

  return (
    <VisitsComparison
      title={`Comparing "${domainsArray.join('", "')}"`}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={domainVisitsComparison}
      cancelGetVisitsComparison={cancelGetDomainVisitsComparison}
    />
  );
};
