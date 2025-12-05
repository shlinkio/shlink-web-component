import { useToggle } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { ShlinkApiClient, ShlinkShortUrl } from '../../api-contract';
import { withDependencies } from '../../container/context';
import { ExportBtn } from '../../utils/components/ExportBtn';
import type { ReportExporter } from '../../utils/services/ReportExporter';
import { useShortUrlsQuery } from './hooks';

export type ExportShortUrlsBtnProps = {
  amount?: number;
  apiClientFactory: () => ShlinkApiClient,
  ReportExporter: ReportExporter,
};

const itemsPerPage = 20;

const ExportShortUrlsBtnBase: FC<ExportShortUrlsBtnProps> = (
  { amount = 0, apiClientFactory, ReportExporter: reportExporter },
) => {
  const [{ tags, search, startDate, endDate, orderBy, tagsMode }] = useShortUrlsQuery();
  const { flag: loading, setToTrue: startLoading, setToFalse: stopLoading } = useToggle();
  const exportAllUrls = useCallback(async () => {
    const totalPages = amount / itemsPerPage;
    const loadAllUrls = async (page = 1): Promise<ShlinkShortUrl[]> => {
      const { data } = await apiClientFactory().listShortUrls(
        { page: `${page}`, tags, searchTerm: search, startDate, endDate, orderBy, tagsMode, itemsPerPage },
      );

      if (page >= totalPages) {
        return data;
      }

      // TODO Support parallelization
      return data.concat(await loadAllUrls(page + 1));
    };

    startLoading();
    const shortUrls = await loadAllUrls();

    reportExporter.exportShortUrls(shortUrls.map((shortUrl) => {
      const { hostname: domain, pathname } = new URL(shortUrl.shortUrl);
      const shortCode = pathname.substring(1); // Remove trailing slash

      return {
        createdAt: shortUrl.dateCreated,
        domain,
        shortCode,
        shortUrl: shortUrl.shortUrl,
        longUrl: shortUrl.longUrl,
        title: shortUrl.title ?? '',
        tags: shortUrl.tags.join('|'),
        visits: shortUrl.visitsSummary.total,
      };
    }));
    stopLoading();
  }, [
    amount,
    apiClientFactory,
    endDate,
    orderBy,
    reportExporter,
    search,
    startDate,
    startLoading,
    stopLoading,
    tags,
    tagsMode,
  ]);

  return <ExportBtn loading={loading} className="max-xl:w-full" amount={amount} onClick={exportAllUrls} />;
};

export const ExportShortUrlsBtn = withDependencies(ExportShortUrlsBtnBase, ['apiClientFactory', 'ReportExporter']);
