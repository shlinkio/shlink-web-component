import type { FC } from 'react';
import { useCallback } from 'react';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import type { LoadDomainVisitsForComparison } from './reducers/domainVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type DomainVisitsComparisonProps = {
  getDomainVisitsForComparison: (params: LoadDomainVisitsForComparison) => void;
  domainVisitsComparison: VisitsComparisonInfo;
  cancelGetDomainVisitsComparison: () => void;
};

export const DomainVisitsComparison: FC<DomainVisitsComparisonProps> = boundToMercureHub((
  { getDomainVisitsForComparison, domainVisitsComparison, cancelGetDomainVisitsComparison },
) => {
  const domains = useArrayQueryParam('domains');
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getDomainVisitsForComparison({ ...params, domains }),
    [domains, getDomainVisitsForComparison],
  );

  return (
    <VisitsComparison
      title={`Comparing "${domains.join('", "')}"`}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={domainVisitsComparison}
      cancelGetVisitsComparison={cancelGetDomainVisitsComparison}
    />
  );
}, () => [Topics.visits]);
