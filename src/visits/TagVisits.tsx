import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { ShlinkVisitsParams } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { useGoBack } from '../utils/helpers/hooks';
import type { ColorGenerator } from '../utils/services/ColorGenerator';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadTagVisits, TagVisits as TagVisitsState } from './reducers/tagVisits';
import { TagVisitsHeader } from './TagVisitsHeader';
import type { NormalizedVisit } from './types';
import { toApiParams } from './types/helpers';
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
  const goBack = useGoBack();
  const { tag = '' } = useParams();
  const loadVisits = useCallback(
    (params: ShlinkVisitsParams, doIntervalFallback?: boolean) =>
      getTagVisits({ tag, query: toApiParams(params), doIntervalFallback }),
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
      <TagVisitsHeader tagVisits={tagVisits} goBack={goBack} colorGenerator={colorGenerator} />
    </VisitsStats>
  );
}, () => [Topics.visits]);

export const TagVisitsFactory = componentFactory(TagVisits, ['ColorGenerator', 'ReportExporter']);
