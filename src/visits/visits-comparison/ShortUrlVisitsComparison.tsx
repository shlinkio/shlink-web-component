import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { ShlinkShortUrlIdentifier,ShlinkVisit } from '../../api-contract';
import type { MercureBoundProps } from '../../mercure/helpers/boundToMercureHub';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { queryToShortUrl, shortUrlToQuery } from '../../short-urls/helpers';
import type { ShortUrlsDetails } from '../../short-urls/reducers/shortUrlsDetails';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import type { LoadShortUrlVisitsForComparison } from './reducers/shortUrlVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

type ShortUrlVisitsComparisonProps = MercureBoundProps & {
  getShortUrlVisitsForComparison: (params: LoadShortUrlVisitsForComparison) => void;
  shortUrlVisitsComparison: VisitsComparisonInfo;
  cancelGetShortUrlVisitsComparison: () => void;
  shortUrlsDetails: ShortUrlsDetails;
  getShortUrlsDetails: (identifiers: ShlinkShortUrlIdentifier[]) => void;
};

export const ShortUrlVisitsComparison: FC<ShortUrlVisitsComparisonProps> = boundToMercureHub(({
  getShortUrlVisitsForComparison,
  shortUrlVisitsComparison,
  cancelGetShortUrlVisitsComparison,
  shortUrlsDetails,
  getShortUrlsDetails,
}) => {
  const shortUrlIds = useArrayQueryParam('short-urls');
  const identifiers = useMemo(() => shortUrlIds.map(queryToShortUrl), [shortUrlIds]);
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getShortUrlVisitsForComparison({ ...params, shortUrls: identifiers }),
    [getShortUrlVisitsForComparison, identifiers],
  );

  const loadedShortUrls = useMemo(() => [...shortUrlsDetails.shortUrls?.values() ?? []], [shortUrlsDetails.shortUrls]);
  const visitsComparisonInfo = useMemo((): VisitsComparisonInfo => {
    const { visitsGroups: baseVisitsGroups, loading, ...rest } = shortUrlVisitsComparison;
    const visitsGroups = loadedShortUrls.reduce<Record<string, ShlinkVisit[]>>(
      (acc, shortUrl) => {
        acc[shortUrl.shortUrl] = baseVisitsGroups[shortUrlToQuery(shortUrl)] ?? [];
        return acc;
      },
      {},
    );

    return { ...rest, visitsGroups, loading: loading || shortUrlsDetails.loading };
  }, [shortUrlVisitsComparison, shortUrlsDetails.loading, loadedShortUrls]);

  useEffect(() => {
    if (identifiers.length > 0) {
      getShortUrlsDetails(identifiers);
    }
  }, [getShortUrlsDetails, identifiers]);

  return (
    <VisitsComparison
      title={(
        <span data-testid="title">
          {shortUrlsDetails.loading
            ? 'Loading...'
            : `Comparing ${loadedShortUrls.length} short URLs`}
        </span>
      )}
      getVisitsForComparison={getVisitsForComparison}
      visitsComparisonInfo={visitsComparisonInfo}
      cancelGetVisitsComparison={cancelGetShortUrlVisitsComparison}
    />
  );
}, () => [Topics.visits]);
