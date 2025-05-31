import { formatNumber, roundTen as sharedRoundTen } from '@shlinkio/shlink-frontend-kit/tailwind';

/** @deprecated Use formatNumber from @shlinkio/shlink-frontend-kit */
export const prettify = formatNumber;

/** @deprecated Use roundTen from @shlinkio/shlink-frontend-kit */
export const roundTen = sharedRoundTen;
