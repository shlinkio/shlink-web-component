import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useGoBack } from '../utils/helpers/hooks';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadOrphanVisits } from './reducers/orphanVisits';
import type { VisitsInfo } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { toApiParams } from './types/helpers';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type OrphanVisitsProps = {
  getOrphanVisits: (params: LoadOrphanVisits) => void;
  orphanVisits: VisitsInfo;
  cancelGetOrphanVisits: () => void;
};

type OrphanVisitsDeps = {
  ReportExporter: ReportExporter
};

const OrphanVisits: FCWithDeps<MercureBoundProps & OrphanVisitsProps, OrphanVisitsDeps> = boundToMercureHub((
  { getOrphanVisits, orphanVisits, cancelGetOrphanVisits },
) => {
  const { ReportExporter: reportExporter } = useDependencies(OrphanVisits);
  const goBack = useGoBack();
  const exportCsv = (visits: NormalizedVisit[]) => reportExporter.exportVisits('orphan_visits.csv', visits);
  const loadVisits = (params: VisitsParams, doIntervalFallback?: boolean) => getOrphanVisits(
    { query: toApiParams(params), orphanVisitsType: params.filter?.orphanVisitsType, doIntervalFallback },
  );

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetOrphanVisits}
      visitsInfo={orphanVisits}
      exportCsv={exportCsv}
      isOrphanVisits
    >
      <VisitsHeader title="Orphan visits" goBack={goBack} visits={orphanVisits.visits} />
    </VisitsStats>
  );
}, () => [Topics.orphanVisits]);

export const OrphanVisitsFactory = componentFactory(OrphanVisits, ['ReportExporter']);
