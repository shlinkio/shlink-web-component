import type { Order } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkShortUrl } from '../../api-contract';

export type ShortUrlModalProps = {
  shortUrl: ShlinkShortUrl;
  isOpen: boolean;
  onClose: () => void;
};

export const SHORT_URLS_ORDERABLE_FIELDS = {
  dateCreated: 'Created at',
  shortCode: 'Short URL',
  longUrl: 'Long URL',
  title: 'Title',
  visits: 'Visits',
};

export type ShortUrlsOrderableFields = keyof typeof SHORT_URLS_ORDERABLE_FIELDS;

export type ShortUrlsOrder = Order<ShortUrlsOrderableFields>;

export type ExportableShortUrl = {
  createdAt: string;
  title: string;
  shortUrl: string;
  domain?: string;
  shortCode: string;
  longUrl: string;
  tags: string;
  visits: number;
};

export type ShortUrlsFilter = {
  excludeBots?: boolean;
  excludeMaxVisitsReached?: boolean;
  excludePastValidUntil?: boolean;
};
