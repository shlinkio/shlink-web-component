import { useCallback } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useGoBack } from '../utils/helpers/hooks';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadVisits, VisitsInfo } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { toApiParams } from './types/helpers';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type NonOrphanVisitsProps = {
  getNonOrphanVisits: (params: LoadVisits) => void;
  nonOrphanVisits: VisitsInfo;
  cancelGetNonOrphanVisits: () => void;
};

type NonOrphanVisitsDeps = {
  ReportExporter: ReportExporter;
};

const NonOrphanVisits: FCWithDeps<MercureBoundProps & NonOrphanVisitsProps, NonOrphanVisitsDeps> = boundToMercureHub((
  { getNonOrphanVisits, nonOrphanVisits, cancelGetNonOrphanVisits },
) => {
  const { ReportExporter: reportExporter } = useDependencies(NonOrphanVisits);
  const goBack = useGoBack();
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits('non_orphan_visits.csv', visits),
    [reportExporter],
  );
  const loadVisits = useCallback(
    (params: VisitsParams, doIntervalFallback?: boolean) =>
      getNonOrphanVisits({ query: toApiParams(params), doIntervalFallback }),
    [getNonOrphanVisits],
  );

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetNonOrphanVisits}
      visitsInfo={nonOrphanVisits}
      exportCsv={exportCsv}
    >
      <VisitsHeader title="Non-orphan visits" goBack={goBack} visits={nonOrphanVisits.visits} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const NonOrphanVisitsFactory = componentFactory(NonOrphanVisits, ['ReportExporter']);
