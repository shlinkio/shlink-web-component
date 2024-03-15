import { useCallback, useEffect, useMemo } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { MercureBoundProps } from '../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import type { ShortUrlIdentifier } from '../short-urls/data';
import { urlDecodeShortCode } from '../short-urls/helpers';
import { useShortUrlIdentifier } from '../short-urls/helpers/hooks';
import type { ShortUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import { useFeature } from '../utils/features';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadShortUrlVisits, ShortUrlVisits as ShortUrlVisitsState } from './reducers/shortUrlVisits';
import type { ShortUrlVisitsDeletion } from './reducers/shortUrlVisitsDeletion';
import type { GetVisitsOptions } from './reducers/types';
import { ShortUrlVisitsHeader } from './ShortUrlVisitsHeader';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsStats } from './VisitsStats';

export type ShortUrlVisitsProps = {
  shortUrlVisits: ShortUrlVisitsState;
  shortUrlVisitsDeletion: ShortUrlVisitsDeletion;
  getShortUrlVisits: (params: LoadShortUrlVisits) => void;
  deleteShortUrlVisits: (shortUrl: ShortUrlIdentifier) => void;
  getShortUrlsDetails: (identifiers: ShortUrlIdentifier[]) => void;
  shortUrlsDetails: ShortUrlsDetails;
  cancelGetShortUrlVisits: () => void;
};

type ShortUrlVisitsDeps = {
  ReportExporter: ReportExporter
};

const ShortUrlVisits: FCWithDeps<MercureBoundProps & ShortUrlVisitsProps, ShortUrlVisitsDeps> = boundToMercureHub(({
  shortUrlVisits,
  shortUrlVisitsDeletion,
  shortUrlsDetails,
  getShortUrlVisits,
  getShortUrlsDetails,
  deleteShortUrlVisits,
  cancelGetShortUrlVisits,
}: ShortUrlVisitsProps) => {
  const supportsShortUrlVisitsDeletion = useFeature('shortUrlVisitsDeletion');
  const { ReportExporter: reportExporter } = useDependencies(ShortUrlVisits);
  const identifier = useShortUrlIdentifier();
  const shortUrl = useMemo(() => shortUrlsDetails.shortUrls?.get(identifier), [identifier, shortUrlsDetails.shortUrls]);

  const loadVisits = useCallback(
    (params: VisitsParams, options: GetVisitsOptions) => getShortUrlVisits({
      ...identifier,
      options,
      params,
    }),
    [getShortUrlVisits, identifier],
  );
  const exportCsv = useCallback((visits: NormalizedVisit[]) => reportExporter.exportVisits(
    `short-url_${shortUrl?.shortUrl.replace(/https?:\/\//g, '')}_visits.csv`,
    visits,
  ), [reportExporter, shortUrl?.shortUrl]);
  const deletion = useMemo(() => {
    if (!supportsShortUrlVisitsDeletion) {
      return undefined;
    }

    const deleteVisits = () => deleteShortUrlVisits(identifier);
    return { deleteVisits, visitsDeletion: shortUrlVisitsDeletion };
  }, [deleteShortUrlVisits, identifier, shortUrlVisitsDeletion, supportsShortUrlVisitsDeletion]);

  useEffect(() => {
    getShortUrlsDetails([identifier]);
  }, [identifier, getShortUrlsDetails]);

  return (
    <VisitsStats
      getVisits={loadVisits}
      cancelGetVisits={cancelGetShortUrlVisits}
      visitsInfo={shortUrlVisits}
      exportCsv={exportCsv}
      deletion={deletion}
    >
      <ShortUrlVisitsHeader shortUrl={shortUrl} loading={shortUrlsDetails.loading} shortUrlVisits={shortUrlVisits} />
    </VisitsStats>
  );
}, (params) => (params.shortCode ? [Topics.shortUrlVisits(urlDecodeShortCode(params.shortCode))] : []));

export const ShortUrlVisitsFactory = componentFactory(ShortUrlVisits, ['ReportExporter']);
