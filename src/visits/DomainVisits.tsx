import { useCallback } from 'react';
import { useParams } from 'react-router';
import { withDependencies } from '../container/context';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import { useDomainVisits } from './reducers/domainVisits';
import type { GetVisitsOptions } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type DomainVisitsProps = {
  ReportExporter: ReportExporter
};

const DomainVisitsBase = boundToMercureHub<DomainVisitsProps>(({ ReportExporter: exporter }) => {
  const { domain = '' } = useParams();
  const [authority, domainId = authority] = domain.split('_');
  const { getDomainVisits, domainVisits, cancelGetDomainVisits } = useDomainVisits();
  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getDomainVisits({
      domain: domainId,
      options,
      params,
    }),
    [domainId, getDomainVisits],
  );
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => exporter.exportVisits(`domain_${authority}_visits.csv`, visits),
    [authority, exporter],
  );

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetDomainVisits}
      visitsInfo={domainVisits}
      exportCsv={exportCsv}
    >
      <VisitsHeader visits={domainVisits.visits} title={`"${authority}" visits`} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const DomainVisits = withDependencies(DomainVisitsBase, ['ReportExporter']);
