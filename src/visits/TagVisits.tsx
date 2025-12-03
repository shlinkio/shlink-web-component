import { useCallback } from 'react';
import { useParams } from 'react-router';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { useDomainsList } from '../domains/reducers/domainsList';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import type { ReportExporter } from '../utils/services/ReportExporter';
import { useTagVisits } from './reducers/tagVisits';
import type { GetVisitsOptions } from './reducers/types';
import { TagVisitsHeader } from './TagVisitsHeader';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsStats } from './VisitsStats';

type TagVisitsDeps = {
  ColorGenerator: ColorGenerator;
  ReportExporter: ReportExporter;
};

const TagVisits: FCWithDeps<any, TagVisitsDeps> = boundToMercureHub(() => {
  const { ColorGenerator: colorGenerator, ReportExporter: reportExporter } = useDependencies(TagVisits);
  const { domainsList } = useDomainsList();
  const { tag = '' } = useParams();
  const { getTagVisits, tagVisits, cancelGetTagVisits } = useTagVisits();
  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getTagVisits({
      tag,
      params,
      options,
      domain: params.filter?.domain,
    }),
    [getTagVisits, tag],
  );
  const exportCsv = useCallback(
    (visits: NormalizedVisit[]) => reportExporter.exportVisits(`tag_${tag}_visits.csv`, visits),
    [reportExporter, tag],
  );

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetTagVisits}
      visitsInfo={tagVisits}
      exportCsv={exportCsv}
      domains={domainsList.domains}
    >
      <TagVisitsHeader tagVisits={tagVisits} colorGenerator={colorGenerator} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const TagVisitsFactory = componentFactory(TagVisits, ['ColorGenerator', 'ReportExporter']);
