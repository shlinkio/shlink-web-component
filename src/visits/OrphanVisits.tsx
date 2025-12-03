import { useCallback, useMemo } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { useDomainsList } from '../domains/reducers/domainsList';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import { useOrphanVisits } from './reducers/orphanVisits';
import { useOrphanVisitsDeletion } from './reducers/orphanVisitsDeletion';
import type { GetVisitsOptions } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

type OrphanVisitsDeps = {
  ReportExporter: ReportExporter
};

const OrphanVisits: FCWithDeps<any, OrphanVisitsDeps> = boundToMercureHub(() => {
  const { ReportExporter: reportExporter } = useDependencies(OrphanVisits);
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits('orphan_visits.csv', visits),
    [reportExporter],
  );
  const { getOrphanVisits, orphanVisits, cancelGetOrphanVisits } = useOrphanVisits();
  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getOrphanVisits({
      options,
      params,
      orphanVisitsType: params.filter?.orphanVisitsType,
      domain: params.filter?.domain,
    }),
    [getOrphanVisits],
  );
  const { deleteOrphanVisits, orphanVisitsDeletion } = useOrphanVisitsDeletion();
  const deletion = useMemo(
    () => ({ deleteVisits: deleteOrphanVisits, visitsDeletion: orphanVisitsDeletion }),
    [deleteOrphanVisits, orphanVisitsDeletion],
  );
  const { domainsList } = useDomainsList();

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetOrphanVisits}
      visitsInfo={orphanVisits}
      exportCsv={exportCsv}
      deletion={deletion}
      isOrphanVisits
      domains={domainsList.domains}
    >
      <VisitsHeader title="Orphan visits" visits={orphanVisits.visits} />
    </VisitsStats>
  );
}, () => [Topics.orphanVisits]);

export const OrphanVisitsFactory = componentFactory(OrphanVisits, ['ReportExporter']);
