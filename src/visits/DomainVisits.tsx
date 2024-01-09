import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { ShlinkVisitsParams } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { DomainVisits as DomainVisitsState, LoadDomainVisits } from './reducers/domainVisits';
import type { NormalizedVisit } from './types';
import { toApiParams } from './types/helpers';
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

const DomainVisits: FCWithDeps<MercureBoundProps & DomainVisitsProps, DomainVisitsDeps> = boundToMercureHub((
  { getDomainVisits, domainVisits, cancelGetDomainVisits },
) => {
  const { ReportExporter: exporter } = useDependencies(DomainVisits);
  const { domain = '' } = useParams();
  const [authority, domainId = authority] = domain.split('_');
  const loadVisits = useCallback(
    (params: ShlinkVisitsParams, doIntervalFallback?: boolean) =>
      getDomainVisits({ domain: domainId, query: toApiParams(params), doIntervalFallback }),
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
