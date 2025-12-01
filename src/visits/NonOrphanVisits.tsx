import { useCallback } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { useDomainsList } from '../domains/reducers/domainsList';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { GetVisitsOptions, LoadWithDomainVisits, VisitsInfo } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type NonOrphanVisitsProps = {
  getNonOrphanVisits: (params: LoadWithDomainVisits) => void;
  nonOrphanVisits: VisitsInfo;
  cancelGetNonOrphanVisits: () => void;
};

type NonOrphanVisitsDeps = {
  ReportExporter: ReportExporter;
};

const NonOrphanVisits: FCWithDeps<NonOrphanVisitsProps, NonOrphanVisitsDeps> = boundToMercureHub((
  { getNonOrphanVisits, nonOrphanVisits, cancelGetNonOrphanVisits },
) => {
  const { ReportExporter: reportExporter } = useDependencies(NonOrphanVisits);
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits('non_orphan_visits.csv', visits),
    [reportExporter],
  );
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

export const NonOrphanVisitsFactory = componentFactory(NonOrphanVisits, ['ReportExporter']);
