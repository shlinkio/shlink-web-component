import type { FC } from 'react';
import { useCallback } from 'react';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import { useDomainVisitsComparison } from './reducers/domainVisitsComparison';
import type { LoadVisitsForComparison } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

export const DomainVisitsComparison: FC = boundToMercureHub(() => {
  const domains = useArrayQueryParam('domains');
  const {
    getDomainVisitsForComparison,
    domainVisitsComparison,
    cancelGetDomainVisitsForComparison,
  } = useDomainVisitsComparison();
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getDomainVisitsForComparison({ ...params, domains }),
    [domains, getDomainVisitsForComparison],
  );

  return (
    <VisitsComparison
      title={`Comparing "${domains.join('", "')}"`}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={domainVisitsComparison}
      cancelGetVisitsComparison={cancelGetDomainVisitsForComparison}
    />
  );
}, () => [Topics.visits]);
