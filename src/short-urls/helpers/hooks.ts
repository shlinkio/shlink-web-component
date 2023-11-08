import { orderToString, stringifyQuery, stringToOrder } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { TagsFilteringMode } from '../../api-contract';
import type { BooleanString } from '../../utils/helpers';
import { parseOptionalBooleanToString } from '../../utils/helpers';
import { useParsedQuery } from '../../utils/helpers/hooks';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from '../data';
import { urlDecodeShortCode } from './index';

interface ShortUrlsQueryCommon {
  search?: string;
  startDate?: string;
  endDate?: string;
  tagsMode?: TagsFilteringMode;
}

interface ShortUrlsQuery extends ShortUrlsQueryCommon {
  orderBy?: string;
  tags?: string;
  excludeBots?: BooleanString;
  excludeMaxVisitsReached?: BooleanString;
  excludePastValidUntil?: BooleanString;
}

interface ShortUrlsFiltering extends ShortUrlsQueryCommon {
  orderBy?: ShortUrlsOrder;
  tags: string[];
  excludeBots?: boolean;
  excludeMaxVisitsReached?: boolean;
  excludePastValidUntil?: boolean;
}

type ToFirstPage = (extra: Partial<ShortUrlsFiltering>) => void;

export const useShortUrlsQuery = (): [ShortUrlsFiltering, ToFirstPage] => {
  const navigate = useNavigate();
  const routesPrefix = useRoutesPrefix();
  const query = useParsedQuery<ShortUrlsQuery>();

  const filtering = useMemo(
    (): ShortUrlsFiltering => {
      const { orderBy, tags, excludeBots, excludeMaxVisitsReached, excludePastValidUntil, ...rest } = query;
      const parsedOrderBy = orderBy ? stringToOrder<ShortUrlsOrderableFields>(orderBy) : undefined;
      const parsedTags = tags?.split(',') ?? [];
      return {
        ...rest,
        orderBy: parsedOrderBy,
        tags: parsedTags,
        excludeBots: excludeBots !== undefined ? excludeBots === 'true' : undefined,
        excludeMaxVisitsReached: excludeMaxVisitsReached !== undefined ? excludeMaxVisitsReached === 'true' : undefined,
        excludePastValidUntil: excludePastValidUntil !== undefined ? excludePastValidUntil === 'true' : undefined,
      };
    },
    [query],
  );
  const toFirstPageWithExtra = useCallback((extra: Partial<ShortUrlsFiltering>) => {
    const merged = { ...filtering, ...extra };
    const { orderBy, tags, excludeBots, excludeMaxVisitsReached, excludePastValidUntil, ...mergedFiltering } = merged;
    const newQuery: ShortUrlsQuery = {
      ...mergedFiltering,
      orderBy: orderBy && orderToString(orderBy),
      tags: tags.length > 0 ? tags.join(',') : undefined,
      excludeBots: parseOptionalBooleanToString(excludeBots),
      excludeMaxVisitsReached: parseOptionalBooleanToString(excludeMaxVisitsReached),
      excludePastValidUntil: parseOptionalBooleanToString(excludePastValidUntil),
    };
    const stringifiedQuery = stringifyQuery(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(`${routesPrefix}/list-short-urls/1${queryString}`);
  }, [filtering, navigate, routesPrefix]);

  return [filtering, toFirstPageWithExtra];
};

/**
 * Reads the short code from route params, and decodes it
 */
export const useDecodedShortCodeFromParams = (): string => {
  const { shortCode = '' } = useParams<{ shortCode: string }>();
  return useMemo(() => urlDecodeShortCode(shortCode), [shortCode]);
};
