import { useCallback } from 'react';
import { useParams } from 'react-router';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { DomainVisits as DomainVisitsState, LoadDomainVisits } from './reducers/domainVisits';
import type { GetVisitsOptions } from './reducers/types';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsHeader } from './VisitsHeader';
import { VisitsStats } from './VisitsStats';

export type DomainVisitsProps = {
  getDomainVisits: (params: LoadDomainVisits) => void;
  domainVisits: DomainVisitsState;
  cancelGetDomainVisits: () => void;
};

type DomainVisitsDeps = {
  ReportExporter: ReportExporter
};

const DomainVisits: FCWithDeps<DomainVisitsProps, DomainVisitsDeps> = boundToMercureHub((
  { getDomainVisits, domainVisits, cancelGetDomainVisits },
) => {
  const { ReportExporter: exporter } = useDependencies(DomainVisits);
  const { domain = '' } = useParams();
  const [authority, domainId = authority] = domain.split('_');
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

export const DomainVisitsFactory = componentFactory(DomainVisits, ['ReportExporter']);
