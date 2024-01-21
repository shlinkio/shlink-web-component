import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadTagVisits, TagVisits as TagVisitsState } from './reducers/tagVisits';
import type { GetVisitsOptions } from './reducers/types';
import { TagVisitsHeader } from './TagVisitsHeader';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsStats } from './VisitsStats';

export type TagVisitsProps = {
  getTagVisits: (params: LoadTagVisits) => void;
  tagVisits: TagVisitsState;
  cancelGetTagVisits: () => void;
};

type TagVisitsDeps = {
  ColorGenerator: ColorGenerator;
  ReportExporter: ReportExporter;
};

const TagVisits: FCWithDeps<MercureBoundProps & TagVisitsProps, TagVisitsDeps> = boundToMercureHub((
  { getTagVisits, tagVisits, cancelGetTagVisits },
) => {
  const { ColorGenerator: colorGenerator, ReportExporter: reportExporter } = useDependencies(TagVisits);
  const { tag = '' } = useParams();
  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getTagVisits({ tag, params, options }),
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
    >
      <TagVisitsHeader tagVisits={tagVisits} colorGenerator={colorGenerator} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const TagVisitsFactory = componentFactory(TagVisits, ['ColorGenerator', 'ReportExporter']);
