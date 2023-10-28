import { parseQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ShortUrlIdentifier } from '../short-urls/data';
import { urlDecodeShortCode } from '../short-urls/helpers';
import type { ShortUrlDetail } from '../short-urls/reducers/shortUrlDetail';
import { useFeature } from '../utils/features';
import { useGoBack } from '../utils/helpers/hooks';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadShortUrlVisits, ShortUrlVisits as ShortUrlVisitsState } from './reducers/shortUrlVisits';
import type { ShortUrlVisitsDeletion } from './reducers/shortUrlVisitsDeletion';
import { ShortUrlVisitsHeader } from './ShortUrlVisitsHeader';
import type { NormalizedVisit, VisitsParams } from './types';
import { toApiParams } from './types/helpers';
import { VisitsStats } from './VisitsStats';

export type ShortUrlVisitsProps = {
  shortUrlVisits: ShortUrlVisitsState;
  shortUrlVisitsDeletion: ShortUrlVisitsDeletion;
  getShortUrlVisits: (params: LoadShortUrlVisits) => void;
  deleteShortUrlVisits: (shortUrl: ShortUrlIdentifier) => void;
  getShortUrlDetail: (shortUrl: ShortUrlIdentifier) => void;
  shortUrlDetail: ShortUrlDetail;
  cancelGetShortUrlVisits: () => void;
};

type ShortUrlVisitsDeps = {
  ReportExporter: ReportExporter
};

const ShortUrlVisits: FCWithDeps<MercureBoundProps & ShortUrlVisitsProps, ShortUrlVisitsDeps> = boundToMercureHub(({
  shortUrlVisits,
  shortUrlVisitsDeletion,
  shortUrlDetail,
  getShortUrlVisits,
  getShortUrlDetail,
  deleteShortUrlVisits,
  cancelGetShortUrlVisits,
}: ShortUrlVisitsProps) => {
  const supportsShortUrlVisitsDeletion = useFeature('shortUrlVisitsDeletion');
  const { ReportExporter: reportExporter } = useDependencies(ShortUrlVisits);
  const { shortCode = '' } = useParams<{ shortCode: string }>();
  const { search } = useLocation();
  const goBack = useGoBack();
  const { domain } = parseQuery<{ domain?: string }>(search);
  const loadVisits = useCallback((params: VisitsParams, doIntervalFallback?: boolean) => getShortUrlVisits({
    shortCode: urlDecodeShortCode(shortCode),
    query: { ...toApiParams(params), domain },
    doIntervalFallback,
  }), [domain, getShortUrlVisits, shortCode]);
  const exportCsv = useCallback((visits: NormalizedVisit[]) => reportExporter.exportVisits(
    `short-url_${shortUrlDetail.shortUrl?.shortUrl.replace(/https?:\/\//g, '')}_visits.csv`,
    visits,
  ), [reportExporter, shortUrlDetail.shortUrl?.shortUrl]);
  const deletion = useMemo(() => {
    if (!supportsShortUrlVisitsDeletion) {
      return undefined;
    }

    const deleteVisits = () => deleteShortUrlVisits({ shortCode, domain });
    return { deleteVisits, visitsDeletion: shortUrlVisitsDeletion };
  }, [deleteShortUrlVisits, domain, shortCode, shortUrlVisitsDeletion, supportsShortUrlVisitsDeletion]);

  useEffect(() => {
    getShortUrlDetail({ shortCode: urlDecodeShortCode(shortCode), domain });
  }, [domain, getShortUrlDetail, shortCode]);

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetShortUrlVisits}
      visitsInfo={shortUrlVisits}
      exportCsv={exportCsv}
      deletion={deletion}
    >
      <ShortUrlVisitsHeader shortUrlDetail={shortUrlDetail} shortUrlVisits={shortUrlVisits} goBack={goBack} />
    </VisitsStats>
  );
}, (params) => (params.shortCode ? [Topics.shortUrlVisits(urlDecodeShortCode(params.shortCode))] : []));

export const ShortUrlVisitsFactory = componentFactory(ShortUrlVisits, ['ReportExporter']);
