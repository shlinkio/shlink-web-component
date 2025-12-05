import { useCallback } from 'react';
import { withDependencies } from '../container/context';
import { useDomainsList } from '../domains/reducers/domainsList';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import { useNonOrphanVisits } from './reducers/nonOrphanVisits';
import type { GetVisitsOptions } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type NonOrphanVisitsProps = {
  ReportExporter: ReportExporter;
};

const NonOrphanVisitsBase = boundToMercureHub<NonOrphanVisitsProps>(({ ReportExporter: reportExporter }) => {
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits('non_orphan_visits.csv', visits),
    [reportExporter],
  );
  const { getNonOrphanVisits, nonOrphanVisits, cancelGetNonOrphanVisits } = useNonOrphanVisits();
  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getNonOrphanVisits({
      options,
      params,
      domain: params.filter?.domain,
    }),
    [getNonOrphanVisits],
  );
  const { domainsList } = useDomainsList();

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetNonOrphanVisits}
      visitsInfo={nonOrphanVisits}
      exportCsv={exportCsv}
      domains={domainsList.domains}
    >
      <VisitsHeader title="Non-orphan visits" visits={nonOrphanVisits.visits} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const NonOrphanVisits = withDependencies(NonOrphanVisitsBase, ['ReportExporter']);
