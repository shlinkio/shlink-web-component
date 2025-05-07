import type { NumberOrEllipsis as ShlinkNumberOrEllipsis } from '@shlinkio/shlink-frontend-kit/tailwind';
import {
  ELLIPSIS as SHLINK_ELLIPSIS,
  keyForPage as shlinkKeyForPage,
  pageIsEllipsis as shlinkPageIsEllipsis,
  prettifyPageNumber as shlinkPrettifyPageNumber,
  progressivePagination as shlinkProgressivePagination,
} from '@shlinkio/shlink-frontend-kit/tailwind';

/** @deprecated Use same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export const ELLIPSIS = SHLINK_ELLIPSIS;

/** @deprecated Use same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export type NumberOrEllipsis = ShlinkNumberOrEllipsis;

/** @deprecated se same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export const progressivePagination = shlinkProgressivePagination;

/** @deprecated se same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export const pageIsEllipsis = shlinkPageIsEllipsis;

/** @deprecated se same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export const prettifyPageNumber = shlinkPrettifyPageNumber;

/** @deprecated se same symbol from @shlinkio/shlink-frontend-kit/tailwind */
export const keyForPage = shlinkKeyForPage;
