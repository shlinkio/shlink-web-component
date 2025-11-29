import { useCallback, useEffect, useMemo } from 'react';
import type { ShlinkShortUrlIdentifier } from '../api-contract';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { Topics } from '../mercure/helpers/Topics';
import { urlDecodeShortCode } from '../short-urls/helpers';
import { useShortUrlIdentifier } from '../short-urls/helpers/hooks';
import type { ShortUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import type { ReportExporter } from '../utils/services/ReportExporter';
import type { LoadShortUrlVisits, ShortUrlVisits as ShortUrlVisitsState } from './reducers/shortUrlVisits';
import { useUrlVisitsDeletion } from './reducers/shortUrlVisitsDeletion';
import type { GetVisitsOptions } from './reducers/types';
import { ShortUrlVisitsHeader } from './ShortUrlVisitsHeader';
import type { NormalizedVisit, VisitsParams } from './types';
import { VisitsStats } from './VisitsStats';

export type ShortUrlVisitsProps = {
  shortUrlVisits: ShortUrlVisitsState;
  getShortUrlVisits: (params: LoadShortUrlVisits) => void;
  getShortUrlsDetails: (identifiers: ShlinkShortUrlIdentifier[]) => void;
  shortUrlsDetails: ShortUrlsDetails;
  cancelGetShortUrlVisits: () => void;
};

type ShortUrlVisitsDeps = {
  ReportExporter: ReportExporter
};

const ShortUrlVisits: FCWithDeps<ShortUrlVisitsProps, ShortUrlVisitsDeps> = boundToMercureHub(({
  shortUrlVisits,
  shortUrlsDetails,
  getShortUrlVisits,
  getShortUrlsDetails,
  cancelGetShortUrlVisits,
}: ShortUrlVisitsProps) => {
  const { ReportExporter: reportExporter } = useDependencies(ShortUrlVisits);
  const identifier = useShortUrlIdentifier();
  const shortUrls = shortUrlsDetails.status === 'loaded' ? shortUrlsDetails.shortUrls : undefined;
  const shortUrl = useMemo(() => shortUrls?.get(identifier), [identifier, shortUrls]);

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

  const { shortUrlVisitsDeletion, deleteShortUrlVisits } = useUrlVisitsDeletion();
  const deletion = useMemo(() => {
    const deleteVisits = () => deleteShortUrlVisits(identifier);
    return { deleteVisits, visitsDeletion: shortUrlVisitsDeletion };
  }, [deleteShortUrlVisits, identifier, shortUrlVisitsDeletion]);

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
      <ShortUrlVisitsHeader
        shortUrl={shortUrl}
        loading={shortUrlsDetails.status === 'loading'}
        shortUrlVisits={shortUrlVisits}
      />
    </VisitsStats>
  );
}, (params) => (params.shortCode ? [Topics.shortUrlVisits(urlDecodeShortCode(params.shortCode))] : []));

export const ShortUrlVisitsFactory = componentFactory(ShortUrlVisits, ['ReportExporter']);
