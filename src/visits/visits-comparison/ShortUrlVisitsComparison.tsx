import type { FC } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { ShlinkVisit } from '../../api-contract';
import { boundToMercureHub } from '../../mercure/helpers/boundToMercureHub';
import { Topics } from '../../mercure/helpers/Topics';
import { queryToShortUrl, shortUrlToQuery } from '../../short-urls/helpers';
import { useUrlsDetails } from '../../short-urls/reducers/shortUrlsDetails';
import { useArrayQueryParam } from '../../utils/helpers/hooks';
import { useUrlVisitsComparison } from './reducers/shortUrlVisitsComparison';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './reducers/types';
import { VisitsComparison } from './VisitsComparison';

export const ShortUrlVisitsComparison: FC = boundToMercureHub(() => {
  const shortUrlIds = useArrayQueryParam('short-urls');
  const identifiers = useMemo(() => shortUrlIds.map(queryToShortUrl), [shortUrlIds]);
  const {
    getShortUrlVisitsForComparison,
    shortUrlVisitsComparison,
    cancelGetShortUrlVisitsComparison,
  } = useUrlVisitsComparison();
  const getVisitsForComparison = useCallback(
    (params: LoadVisitsForComparison) => getShortUrlVisitsForComparison({ ...params, shortUrls: identifiers }),
    [getShortUrlVisitsForComparison, identifiers],
  );
  const { shortUrlsDetails, getShortUrlsDetails } = useUrlsDetails();

  const shortUrls = shortUrlsDetails.status === 'loaded' ? shortUrlsDetails.shortUrls : undefined;
  const loadedShortUrls = useMemo(() => [...shortUrls?.values() ?? []], [shortUrls]);
  const visitsComparisonInfo = useMemo((): VisitsComparisonInfo => {
    const { visitsGroups: baseVisitsGroups, loading, ...rest } = shortUrlVisitsComparison;
    const visitsGroups = loadedShortUrls.reduce<Record<string, ShlinkVisit[]>>(
      (acc, shortUrl) => {
        acc[shortUrl.shortUrl] = baseVisitsGroups[shortUrlToQuery(shortUrl)] ?? [];
        return acc;
      },
      {},
    );

    return { ...rest, visitsGroups, loading: loading || shortUrlsDetails.status === 'loading' };
  }, [shortUrlVisitsComparison, shortUrlsDetails.status, loadedShortUrls]);

  useEffect(() => {
    if (identifiers.length > 0) {
      getShortUrlsDetails(identifiers);
    }
  }, [getShortUrlsDetails, identifiers]);

  return (
    <VisitsComparison
      title={(
        <span data-testid="title">
          {shortUrlsDetails.status === 'loading'
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
