import { useCallback, useMemo } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { DomainsList } from '../domains/reducers/domainsList';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadOrphanVisits } from './reducers/orphanVisits';
import { useOrphanVisitsDeletion } from './reducers/orphanVisitsDeletion';
import type { GetVisitsOptions, VisitsInfo } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type OrphanVisitsProps = {
  getOrphanVisits: (params: LoadOrphanVisits) => void;
  orphanVisits: VisitsInfo;
  cancelGetOrphanVisits: () => void;
  domainsList: DomainsList;
};

type OrphanVisitsDeps = {
  ReportExporter: ReportExporter
};

const OrphanVisits: FCWithDeps<OrphanVisitsProps, OrphanVisitsDeps> = boundToMercureHub((
  { getOrphanVisits, orphanVisits, cancelGetOrphanVisits, domainsList },
) => {
  const { ReportExporter: reportExporter } = useDependencies(OrphanVisits);
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits('orphan_visits.csv', visits),
    [reportExporter],
  );
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
